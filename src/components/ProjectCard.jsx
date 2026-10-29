import { Link } from 'react-router-dom';
import { img } from '../data/sampleProjects.js';

const statusLabel = { completed: 'Completed', ongoing: 'Ongoing', upcoming: 'Upcoming' };

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-[var(--radius-card)] border border-line bg-bg transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-bg-soft">
        <img
          src={img(project.cover, 800)}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <p className="text-sm text-ink-soft">{statusLabel[project.status]}</p>
        <p className="mt-0.5 font-semibold">{project.title}</p>
        {project.builtUpAreaSqft && (
          <p className="mt-1 text-sm text-ink-soft">{project.builtUpAreaSqft.toLocaleString('en-IN')} sq ft built-up</p>
        )}
      </div>
    </Link>
  );
}
