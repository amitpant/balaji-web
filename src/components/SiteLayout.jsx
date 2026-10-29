import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { nav } from '../config/site.js';
import { useAllProjects, useSettings } from '../api/hooks.js';
import { photo } from '../lib/photo.js';
import { initPixel, track } from '../lib/pixel.js';
import FloatingContact from './FloatingContact.jsx';
import SocialIcons from './SocialIcons.jsx';

export default function SiteLayout() {
  const [open, setOpen] = useState(false);
  const site = useSettings();
  const { isSample } = useAllProjects();
  const { pathname } = useLocation();
  const pixelId = site.marketing.facebookPixelId;

  useEffect(() => {
    initPixel(pixelId);
  }, [pixelId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    track('PageView');
  }, [pathname, pixelId]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight" onClick={() => setOpen(false)}>
            {site.logo && <img src={photo(site.logo, 96)} alt="" className="h-8 w-8 rounded object-contain" />}
            {site.name}
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-[15px] transition-colors hover:text-ink ${isActive ? 'font-medium text-ink' : 'text-ink-soft'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="rounded-full bg-accent px-5 py-2 text-[15px] font-medium text-accent-ink hover:opacity-90"
            >
              Free consultation
            </Link>
          </nav>

          <button
            type="button"
            className="-mr-2 p-2 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="border-t border-line px-5 pb-5 md:hidden" aria-label="Mobile">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className="block border-b border-line py-3.5 text-ink">
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-bg-soft">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
          <div>
            <p className="font-semibold">{site.name}</p>
            {site.address && <p className="mt-2 whitespace-pre-line text-ink-soft">{site.address}</p>}
            <div className="mt-4">
              <SocialIcons social={site.social} />
            </div>
          </div>
          <div className="text-ink-soft">
            {site.phone && (
              <p>
                <a href={`tel:${site.phone}`} className="hover:text-ink">{site.phone}</a>
              </p>
            )}
            {site.email && (
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-ink">{site.email}</a>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-ink-soft md:justify-end">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} className="hover:text-ink">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="pb-8 text-center text-sm text-ink-soft">
          © {new Date().getFullYear()} {site.name}
          {isSample && ' · Preview: projects and photos are samples'}
        </p>
      </footer>

      <FloatingContact phone={site.phone} whatsapp={site.whatsapp} message={site.social.whatsappMessage} />
    </div>
  );
}
