import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAllProjects, useProject } from '../api/hooks.js';
import { photo, photosOf } from '../lib/photo.js';
import NotFound from './NotFound.jsx';

const statusLabel = { completed: 'Completed', ongoing: 'Ongoing', upcoming: 'Upcoming' };
const monthYear = (ym) => new Date(`${ym.slice(0, 7)}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
const inr = (n) =>
  n >= 10000000
    ? `₹${(n / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} crore`
    : `₹${(n / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} lakh`;
const sqft = (n) => n > 0 && `${n.toLocaleString('en-IN')} sq ft`;

export default function ProjectDetail() {
  const { slug } = useParams();
  const { projects, isSample, isLoading: listLoading } = useAllProjects();
  const q = useProject(slug, isSample || listLoading);
  const project = isSample ? projects.find((p) => p.slug === slug) : q.data;
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (listLoading || (!isSample && q.isLoading)) {
    return <div className="mx-auto max-w-6xl px-5 py-16 text-ink-soft">Loading…</div>;
  }
  if (!project) return <NotFound />;

  const photos = photosOf(project);
  const [first, ...rest] = photos;

  // Only filled fields are shown (design rule from balaji-docs).
  const facts = [
    ['Status', statusLabel[project.status]],
    ['Location', project.location],
    ['Plot area', sqft(project.plotAreaSqft)],
    ['Built-up area', sqft(project.builtUpAreaSqft)],
    ['Floors', project.floors > 0 && project.floors],
    ['Cost', project.cost?.amountInr > 0 ? inr(project.cost.amountInr) : project.cost?.onRequest ? 'On request' : null],
    ['Started', project.startDate && monthYear(project.startDate)],
    ['Completed', project.completionDate && monthYear(project.completionDate)],
  ].filter(([, v]) => v);

  return (
    <article className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
      <Link to="/projects" className="text-sm text-ink-soft hover:text-ink">
        ← All projects
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight lg:text-5xl">{project.title}</h1>

      {first && (
        <button type="button" onClick={() => setOpen(0)} className="mt-8 block w-full overflow-hidden rounded-[var(--radius-card)] bg-bg-soft">
          <img src={photo(first, 1600)} alt={project.title} className="aspect-[16/9] w-full object-cover" />
        </button>
      )}

      {rest.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {rest.map((img, i) => (
            <button key={img.url} type="button" onClick={() => setOpen(i + 1)} className="overflow-hidden rounded-[var(--radius-card)] bg-bg-soft">
              <img src={photo(img, 600)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {project.description && <p className="text-lg leading-relaxed whitespace-pre-line">{project.description}</p>}
          {project.highlights?.length > 0 && (
            <>
              <h2 className="mt-10 font-semibold">Highlights</h2>
              <ul className="mt-3 space-y-2 text-ink-soft">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        {facts.length > 0 && (
          <dl className="self-start rounded-[var(--radius-card)] border border-line">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {project.videos?.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold">Videos</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {project.videos.map((id) => (
              <div key={id} className="aspect-video overflow-hidden rounded-[var(--radius-card)] bg-bg-soft">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  title="Project video"
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-14 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-bg-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium">Planning something similar?</p>
        <Link to="/contact" className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink hover:opacity-90">
          Get a free consultation
        </Link>
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(null)}
        >
          <img src={photo(photos[open], 2000)} alt="" className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          <button type="button" aria-label="Close" className="absolute top-4 right-4 p-2 text-white" onClick={() => setOpen(null)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {photos.length > 1 && (
            <button
              type="button"
              aria-label="Next photo"
              className="absolute right-4 bottom-6 rounded-full bg-white/15 px-5 py-2 text-white"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open + 1) % photos.length);
              }}
            >
              Next →
            </button>
          )}
        </div>
      )}
    </article>
  );
}
