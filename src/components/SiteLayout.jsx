import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '../api/hooks.js';
import { useT } from '../i18n/index.jsx';
import { parsePath, localize } from '../i18n/meta.js';
import { photo } from '../lib/photo.js';
import { initPixel, track } from '../lib/pixel.js';
import { telHref, whatsappHref } from '../lib/contact.js';
import FloatingContact from './FloatingContact.jsx';
import SocialIcons from './SocialIcons.jsx';
import { ButtonLink } from './ui.jsx';

const NAV = [
  { base: '/projects', key: 'nav.projects' },
  { base: '/services', key: 'nav.services' },
  { base: '/about', key: 'nav.about' },
  { base: '/contact', key: 'nav.contact' },
];

function Logo({ site, lang }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      {site.logo ? (
        <img src={photo(site.logo, 96)} alt="" className="h-10 w-10 rounded-md bg-white object-contain" />
      ) : (
        <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-md bg-charcoal text-lg font-bold text-orange">
          B
        </span>
      )}
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[15px] font-bold tracking-tight sm:text-base">{lang === 'hi' ? 'बालाजी कंस्ट्रक्शन' : 'Balaji Construction'}</span>
        <span className="block truncate text-[11px] font-medium tracking-wide text-muted uppercase sm:text-xs">
          {lang === 'hi' ? 'प्राइवेट लिमिटेड' : 'Private Limited'}
        </span>
      </span>
    </span>
  );
}

export default function SiteLayout() {
  const site = useSettings();
  const { t, path, lang } = useT();
  const { pathname, search, hash } = useLocation();
  const { basePath } = parsePath(pathname);
  const otherLang = lang === 'en' ? 'hi' : 'en';
  const pixelId = site.marketing.facebookPixelId;
  const menuButton = useRef(null);
  // The menu is open only on the page where it was opened, so navigating closes it.
  const [openOn, setOpenOn] = useState(null);
  const open = openOn === pathname;
  const setOpen = (v) => setOpenOn(v ? pathname : null);

  useEffect(() => initPixel(pixelId), [pixelId]);
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    track('PageView');
  }, [pathname, hash, pixelId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenOn(null);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const navCls = ({ isActive }) =>
    `rounded-md px-1 py-2 text-[15px] transition-colors hover:text-orange-ink ${isActive ? 'font-semibold text-charcoal' : 'text-muted'}`;
  const switchHref = localize(otherLang, basePath) + search;
  const tel = telHref(site.phone);
  const wa = whatsappHref(site.whatsapp, site.whatsappMessage || t('contact.whatsappText'));
  const isContact = basePath === '/contact';

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only z-50 rounded bg-charcoal px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {t('skip')}
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5 lg:h-20">
          <Link to={path('/')} className="min-w-0">
            <Logo site={site} lang={lang} />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label={t('nav.menu')}>
            {NAV.map((n) => (
              <NavLink key={n.base} to={path(n.base)} className={navCls}>
                {t(n.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to={switchHref}
              hrefLang={otherLang}
              lang={otherLang}
              aria-label={t('switchLabel')}
              className="rounded-full border border-charcoal/20 px-3 py-2 text-sm font-semibold hover:bg-sage sm:px-3.5"
            >
              {t('switchTo')}
            </Link>
            {!isContact && (
              <span className="hidden sm:block">
                <ButtonLink to={path('/contact')} className="!min-h-10 !px-5 !py-2">
                  {t('cta.enquire')}
                </ButtonLink>
              </span>
            )}
            <button
              ref={menuButton}
              type="button"
              className="grid h-11 w-11 place-items-center rounded-md lg:hidden"
              aria-label={open ? t('nav.close') : t('nav.open')}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(!open)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-menu" className="border-t border-line bg-paper px-5 pb-6 lg:hidden" aria-label={t('nav.menu')}>
            <NavLink to={path('/')} end className="block border-b border-line py-4 text-lg">
              {t('nav.home')}
            </NavLink>
            {NAV.map((n) => (
              <NavLink key={n.base} to={path(n.base)} className="block border-b border-line py-4 text-lg">
                {t(n.key)}
              </NavLink>
            ))}
            <ButtonLink to={path('/contact')} className="mt-5 w-full">
              {t('cta.enquire')}
            </ButtonLink>
          </nav>
        )}
      </header>

      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>

      <footer className="blueprint text-on-dark">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold">{t('company')}</p>
            {lang === 'hi' && <p className="text-sm text-on-dark-muted">{site.name}</p>}
            {site.address && <p className="mt-3 whitespace-pre-line text-on-dark-muted">{site.address}</p>}
            {Object.values(site.social).some(Boolean) && (
              <div className="mt-5">
                <p className="mb-2 text-sm text-on-dark-muted">{t('footer.follow')}</p>
                <SocialIcons social={site.social} dark />
              </div>
            )}
          </div>
          <nav aria-label={t('footer.quick')}>
            <p className="mb-3 text-sm font-semibold tracking-wide text-orange uppercase">{t('footer.quick')}</p>
            <ul className="grid gap-2">
              {[{ base: '/', key: 'nav.home' }, ...NAV].map((n) => (
                <li key={n.base}>
                  <Link to={path(n.base)} className="text-on-dark-muted hover:text-paper">
                    {t(n.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={switchHref} hrefLang={otherLang} lang={otherLang} className="text-on-dark-muted hover:text-paper">
                  {t('switchTo')}
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-orange uppercase">{t('footer.contact')}</p>
            <ul className="grid gap-2 text-on-dark-muted">
              {tel && (
                <li>
                  <a href={tel} className="hover:text-paper">{site.phone}</a>
                </li>
              )}
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noreferrer" className="hover:text-paper">{t('cta.whatsapp')}</a>
                </li>
              )}
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`} className="hover:text-paper">{site.email}</a>
                </li>
              )}
              <li>
                <Link to={path('/contact')} className="font-semibold text-paper hover:text-orange">
                  {t('cta.enquire')} →
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-paper/10">
          <p className="mx-auto max-w-6xl px-5 py-6 text-sm text-on-dark-muted">
            © {new Date().getFullYear()} {site.name}. {t('footer.rights')}
          </p>
        </div>
      </footer>

      <FloatingContact tel={tel} wa={wa} />
    </div>
  );
}
