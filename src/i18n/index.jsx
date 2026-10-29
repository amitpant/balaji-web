import { createContext, useContext, useEffect, useMemo } from 'react';
import { strings } from './strings.js';
import { localize, pageMeta, SITE_NAME } from './meta.js';

const LangContext = createContext('en');

export function LangProvider({ lang, children }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

const lookup = (obj, key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

export function useT() {
  const lang = useContext(LangContext);
  return useMemo(() => {
    const dict = strings[lang];
    const t = (key, vars) => {
      let v = lookup(dict, key) ?? lookup(strings.en, key) ?? key;
      if (vars && typeof v === 'string') v = v.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
      return v;
    };
    const path = (basePath) => localize(lang, basePath);
    const num = (n, opts) => Number(n).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', opts);
    return { lang, t, path, num };
  }, [lang]);
}

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href, hreflang) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

// Keeps title, description, canonical, hreflang and Open Graph tags in sync on client navigation.
export function usePageMeta(page, basePath, project) {
  const { lang } = useT();
  useEffect(() => {
    const m = page === 'project' ? (project ? pageMeta[lang].project(project) : null) : pageMeta[lang][page];
    if (!m) return;
    const origin = window.location.origin;
    document.title = m.title;
    setMeta('name', 'description', m.description);
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:locale', lang === 'hi' ? 'hi_IN' : 'en_IN');
    setMeta('property', 'og:url', origin + localize(lang, basePath));
    setLink('canonical', origin + localize(lang, basePath));
    setLink('alternate', origin + localize('en', basePath), 'en');
    setLink('alternate', origin + localize('hi', basePath), 'hi');
    setLink('alternate', origin + localize('en', basePath), 'x-default');
  }, [lang, page, basePath, project]);
}
