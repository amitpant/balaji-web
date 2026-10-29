import { Link } from 'react-router-dom';
import { coverOf, photo, srcSet } from '../lib/photo.js';
import { useT } from '../i18n/index.jsx';

export default function ProjectCard({ project, eager = false }) {
  const { t, path, num } = useT();
  const cover = coverOf(project);
  return (
    <Link
      to={path(`/projects/${project.slug}`)}
      className="group block overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-lg focus-visible:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sage">
        {cover && (
          <img
            src={photo(cover, 800)}
            srcSet={srcSet(cover, [480, 800, 1200])}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-charcoal/85 px-3 py-1 text-xs font-semibold text-paper">
          {t(`status.${project.status}`)}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg leading-snug font-semibold group-hover:text-orange-ink">{project.title}</h3>
        <p className="mt-1 text-sm text-muted">
          {[project.location, t(`categories.${project.category}`)].filter(Boolean).join(' · ')}
        </p>
        {project.builtUpAreaSqft > 0 && (
          <p className="mt-3 text-sm font-medium">{t('projects.builtUp', { n: num(project.builtUpAreaSqft) })}</p>
        )}
      </div>
    </Link>
  );
}
