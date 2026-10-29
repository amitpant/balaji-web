import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProject } from '../api/hooks.js';
import { useT, usePageMeta } from '../i18n/index.jsx';
import { photo, photosOf, srcSet } from '../lib/photo.js';
import { formatCost, monthYear } from '../lib/contact.js';
import { ButtonLink } from '../components/ui.jsx';
import NotFound from './NotFound.jsx';

function Lightbox({ photos, index, onClose, onMove, t }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onMove(1);
      else if (e.key === 'ArrowLeft') onMove(-1);
      else if (e.key === 'Tab') {
        // Keep focus inside the viewer.
        const items = dialogRef.current.querySelectorAll('button');
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onMove]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('projects.viewer')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
      onClick={onClose}
    >
      <img src={photo(photos[index], 2000)} alt={t('projects.photo', { i: index + 1, n: photos.length })} className="max-h-[85vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
      <p className="absolute top-5 left-5 text-sm text-white/80" aria-live="polite">
        {t('projects.photo', { i: index + 1, n: photos.length })}
      </p>
      <button ref={closeRef} type="button" aria-label={t('projects.closeViewer')} className="absolute top-3 right-3 grid h-12 w-12 place-items-center rounded-full text-white hover:bg-white/10" onClick={onClose}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" aria-label={t('projects.prev')} className="absolute bottom-6 left-4 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25 sm:top-1/2 sm:bottom-auto" onClick={(e) => { e.stopPropagation(); onMove(-1); }}>
            ‹
          </button>
          <button type="button" aria-label={t('projects.next')} className="absolute right-4 bottom-6 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25 sm:top-1/2 sm:bottom-auto" onClick={(e) => { e.stopPropagation(); onMove(1); }}>
            ›
          </button>
        </>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const { t, path, lang, num } = useT();
  const q = useProject(slug);
  const project = q.data;
  usePageMeta('project', `/projects/${slug}`, project);
  const [open, setOpen] = useState(null);

  const photos = photosOf(project);
  const close = useCallback(() => {
    setOpen((i) => {
      // Return focus to the photo that opened the viewer.
      if (i !== null) requestAnimationFrame(() => document.querySelector(`[data-photo="${i}"]`)?.focus());
      return null;
    });
  }, []);
  const move = useCallback((d) => setOpen((i) => (i + d + photos.length) % photos.length), [photos.length]);

  if (q.isLoading) return <p className="mx-auto max-w-6xl px-5 py-20 text-muted">{t('loading')}</p>;
  if (q.isError && q.error.status !== 404) return <p role="alert" className="mx-auto max-w-6xl px-5 py-20 text-orange-ink">{t('projects.error')}</p>;
  if (!project) return <NotFound />;

  const sqft = (n) => n > 0 && t('facts.sqft', { n: num(n) });
  const facts = [
    ['status', t(`status.${project.status}`)],
    ['location', project.location],
    ['plot', sqft(project.plotAreaSqft)],
    ['builtUp', sqft(project.builtUpAreaSqft)],
    ['floors', project.floors > 0 && num(project.floors)],
    ['cost', formatCost(project.cost, t, num)],
    ['started', monthYear(project.startDate, lang)],
    ['completed', monthYear(project.completionDate, lang)],
  ].filter(([, v]) => v);

  const openAt = (i) => () => setOpen(i);
  const [first, ...rest] = photos;

  return (
    <article>
      <header className="blueprint text-on-dark">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-12 lg:pt-14">
          <Link to={path('/projects')} className="text-sm text-on-dark-muted hover:text-paper">
            ← {t('projects.back')}
          </Link>
          <p className="mt-6 text-sm font-semibold tracking-[0.14em] text-orange uppercase">{t(`categories.${project.category}`)}</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-tight lg:text-5xl">{project.title}</h1>
          {project.location && <p className="mt-3 text-lg text-on-dark-muted">{project.location}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 lg:py-14">
        {first && (
          <button type="button" data-photo="0" onClick={openAt(0)} aria-label={t('projects.openPhoto', { i: 1, n: photos.length })} className="block w-full overflow-hidden rounded-xl bg-sage">
            <img src={photo(first, 1600)} srcSet={srcSet(first, [800, 1200, 1600, 2000])} sizes="(min-width: 1152px) 1112px, 100vw" alt="" fetchPriority="high" className="aspect-[16/9] w-full object-cover" />
          </button>
        )}
        {rest.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {rest.map((img, i) => (
              <li key={img.url}>
                <button type="button" data-photo={i + 1} onClick={openAt(i + 1)} aria-label={t('projects.openPhoto', { i: i + 2, n: photos.length })} className="block w-full overflow-hidden rounded-lg bg-sage">
                  <img src={photo(img, 600)} srcSet={srcSet(img, [400, 600, 900])} sizes="(min-width: 1024px) 270px, 50vw" alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition-transform hover:scale-[1.03]" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {project.description && <p className="text-lg leading-relaxed whitespace-pre-line">{project.description}</p>}
            {project.highlights?.length > 0 && (
              <>
                <h2 className="mt-10 text-xl font-semibold">{t('projects.highlights')}</h2>
                <ul className="mt-4 space-y-2">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-sm bg-orange" />
                      {h}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          {facts.length > 0 && (
            <section aria-labelledby="facts-title" className="self-start rounded-xl border border-line bg-white">
              <h2 id="facts-title" className="border-b border-line px-5 py-4 font-semibold">{t('projects.details')}</h2>
              <dl>
                {facts.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
                    <dt className="text-muted">{t(`facts.${k}`)}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        {project.videos?.length > 0 && (
          <section className="mt-14" aria-labelledby="videos-title">
            <h2 id="videos-title" className="text-xl font-semibold">{t('projects.videos')}</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              {project.videos.map((id, i) => (
                <div key={id} className="aspect-video overflow-hidden rounded-xl bg-sage">
                  <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={t('projects.videoTitle', { i: i + 1 })} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-14 flex flex-col items-start gap-4 rounded-xl bg-charcoal p-7 text-paper sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold">{t('projects.similar')}</p>
          <ButtonLink to={path('/contact')}>{t('cta.enquire')}</ButtonLink>
        </div>
      </div>

      {open !== null && <Lightbox photos={photos} index={open} onClose={close} onMove={move} t={t} />}
    </article>
  );
}
