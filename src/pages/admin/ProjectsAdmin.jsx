import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { coverOf, photo } from '../../lib/photo.js';
import { Notice, PageHeader } from './ui.jsx';

const statusLabel = { completed: 'Completed', ongoing: 'Ongoing', upcoming: 'Upcoming' };

export default function ProjectsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-projects'], queryFn: () => api('/admin/projects') });

  const toggle = useMutation({
    mutationFn: (p) => api(`/admin/projects/${p.id}`, { method: 'PUT', body: { ...p, published: !p.published } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['public-projects'] });
    },
  });

  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title="Projects"
        intro="Add your work with photos, videos and details. Only published projects appear on the website."
        action={
          <Link to="/admin/projects/new" className="rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink hover:opacity-90">
            + Add project
          </Link>
        }
      />
      {error && <Notice kind="error">{error.message}</Notice>}
      {toggle.error && <Notice kind="error">{toggle.error.fields?.coverImage || toggle.error.message}</Notice>}
      {isLoading && <p className="text-ink-soft">Loading…</p>}
      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-bg p-10 text-center">
          <p className="font-medium">No projects yet</p>
          <p className="mt-1 text-ink-soft">Add your first project. Until then the website shows sample projects.</p>
          <Link to="/admin/projects/new" className="mt-5 inline-block font-medium text-accent hover:underline">Add your first project →</Link>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-3">
        {items.map((p) => {
          const cover = coverOf(p);
          return (
            <li key={p.id} className="flex min-w-0 items-center gap-3 rounded-[var(--radius-card)] border border-line bg-bg p-3">
              <Link to={`/admin/projects/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                  {cover && <img src={photo(cover, 200)} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="text-sm text-ink-soft">
                    {statusLabel[p.status]}
                    {p.featured && ' · Featured'}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => toggle.mutate(p)}
                disabled={toggle.isPending}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
                  p.published ? 'bg-accent/10 text-accent' : 'bg-bg-soft text-ink-soft'
                }`}
                aria-label={p.published ? `Hide ${p.title}` : `Publish ${p.title}`}
              >
                {p.published ? 'Live' : 'Hidden'}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
