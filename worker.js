// Website Worker
// - /api/*        → forwarded to the balaji-api Worker (same origin, so the admin login cookie works)
// - /robots.txt, /sitemap.xml → generated (sitemap lists every page in English and Hindi)
// - HTML pages    → index.html with the right language, title, description, canonical,
//                   hreflang alternates, Open Graph tags and structured data injected
//                   server-side, so search engines and link previews see real content.
import { pageMeta, parsePath, localize, STATIC_PAGES, SITE_NAME } from './src/i18n/meta.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function apiJson(env, origin, path) {
  if (!env.API) return null;
  try {
    const res = await env.API.fetch(new Request(origin + path));
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

const cloudinary = (url, w) => (url?.includes('/upload/') ? url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${w}/`) : url);

function jsonLd(origin, settings, project, lang, basePath) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    '@id': `${origin}/#company`,
    name: SITE_NAME,
    url: `${origin}/`,
    ...(settings?.phone && { telephone: settings.phone }),
    ...(settings?.email && { email: settings.email }),
    ...(settings?.address && { address: settings.address }),
    ...(settings?.logo?.url && { logo: settings.logo.url }),
  };
  const social = Object.entries(settings?.social || {})
    .filter(([k, v]) => ['facebook', 'instagram', 'youtube'].includes(k) && v)
    .map(([, v]) => v);
  if (social.length) org.sameAs = social;
  const graph = [org];
  if (project) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      url: origin + localize(lang, basePath),
      inLanguage: lang,
      creator: { '@id': `${origin}/#company` },
      ...(project.location && { locationCreated: { '@type': 'Place', name: project.location } }),
      ...(project.coverImage?.url && { image: cloudinary(project.coverImage.url, 1200) }),
    });
  }
  return graph;
}

async function renderPage(request, env, url) {
  const res = await env.ASSETS.fetch(new Request(new URL('/', url), request));
  const { lang, page, slug, basePath } = parsePath(url.pathname);
  if (page === 'notFound' || !res.headers.get('content-type')?.includes('text/html')) {
    return withLang(res, lang, page === 'notFound' ? pageMeta[lang].notFound : pageMeta[lang].home, url, basePath, null, 404);
  }

  const [settings, project] = await Promise.all([
    apiJson(env, url.origin, '/api/settings'),
    page === 'project' ? apiJson(env, url.origin, `/api/projects/${encodeURIComponent(slug)}`) : null,
  ]);
  if (page === 'project' && !project) return withLang(res, lang, pageMeta[lang].notFound, url, basePath, settings, 404);

  const meta = page === 'project' ? pageMeta[lang].project(project) : pageMeta[lang][page];
  const image = project?.coverImage?.url && cloudinary(project.coverImage.url, 1200);
  return withLang(res, lang, meta, url, basePath, settings, 200, project, image);
}

function withLang(res, lang, meta, url, basePath, settings, status, project, image) {
  const origin = url.origin;
  const canonical = origin + localize(lang, basePath);
  const head = [
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<link rel="alternate" hreflang="en" href="${esc(origin + localize('en', basePath))}">`,
    `<link rel="alternate" hreflang="hi" href="${esc(origin + localize('hi', basePath))}">`,
    `<link rel="alternate" hreflang="x-default" href="${esc(origin + localize('en', basePath))}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta property="og:locale" content="${lang === 'hi' ? 'hi_IN' : 'en_IN'}">`,
    image ? `<meta property="og:image" content="${esc(image)}">` : '',
    status === 404 ? '<meta name="robots" content="noindex">' : '',
    `<script type="application/ld+json">${JSON.stringify(jsonLd(origin, settings, project, lang, basePath)).replace(/</g, '\\u003c')}</script>`,
  ].join('');

  const rewritten = new HTMLRewriter()
    .on('html', { element: (el) => el.setAttribute('lang', lang) })
    .on('title', { element: (el) => el.setInnerContent(meta.title) })
    .on('meta[name="description"]', { element: (el) => el.setAttribute('content', meta.description) })
    .on('meta[property="og:title"]', { element: (el) => el.setAttribute('content', meta.title) })
    .on('meta[property="og:description"]', { element: (el) => el.setAttribute('content', meta.description) })
    .on('head', { element: (el) => el.append(head, { html: true }) })
    .transform(res);

  const headers = new Headers(rewritten.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'public, max-age=0, must-revalidate');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  return new Response(rewritten.body, { status, headers });
}

async function sitemap(env, url) {
  const data = await apiJson(env, url.origin, '/api/projects?limit=50');
  const paths = [...STATIC_PAGES, ...(data?.items || []).map((p) => `/projects/${encodeURIComponent(p.slug)}`)];
  const entry = (lang, p) =>
    `<url><loc>${esc(url.origin + localize(lang, p))}</loc>` +
    `<xhtml:link rel="alternate" hreflang="en" href="${esc(url.origin + localize('en', p))}"/>` +
    `<xhtml:link rel="alternate" hreflang="hi" href="${esc(url.origin + localize('hi', p))}"/></url>`;
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    paths.flatMap((p) => [entry('en', p), entry('hi', p)]).join('') +
    '</urlset>';
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (!env.API) {
        return Response.json({ error: { code: 'API_NOT_CONNECTED', message: 'API is not connected yet' } }, { status: 503 });
      }
      return env.API.fetch(request);
    }
    if (url.pathname === '/robots.txt') {
      return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${url.origin}/sitemap.xml\n`, {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    if (url.pathname === '/sitemap.xml') return sitemap(env, url);

    // Static files (built assets, favicon) are served directly.
    if (url.pathname.startsWith('/assets/') || /\.[a-z0-9]+$/i.test(url.pathname)) {
      return env.ASSETS.fetch(request);
    }
    // The admin panel is a client-only app: no SEO injection, not indexed.
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      const res = await env.ASSETS.fetch(new Request(new URL('/', url), request));
      const headers = new Headers(res.headers);
      headers.set('x-robots-tag', 'noindex');
      return new Response(res.body, { status: res.status, headers });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    return renderPage(request, env, url);
  },
};
