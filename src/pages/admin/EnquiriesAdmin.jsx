import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { Notice, PageHeader } from './ui.jsx';

const filters = [
  { id: '', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'closed', label: 'Closed' },
];

const when = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function EnquiriesAdmin() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-enquiries', status],
    queryFn: () => api(`/admin/enquiries${status ? `?status=${status}` : ''}`),
  });
  const update = useMutation({
    mutationFn: ({ id, status }) => api(`/admin/enquiries/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-enquiries'] }),
  });

  const items = data?.items || [];

  return (
    <>
      <PageHeader title="Enquiries" intro="Requests from the website’s contact form, newest first." />
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatus(f.id)}
            aria-pressed={status === f.id}
            className={`rounded-full border px-4 py-1.5 text-sm ${status === f.id ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-bg text-ink-soft'}`}
          >
            {f.label}
            {f.id === 'new' && data?.newCount > 0 && ` (${data.newCount})`}
          </button>
        ))}
      </div>
      {error && <Notice kind="error">{error.message}</Notice>}
      {update.error && <Notice kind="error">{update.error.message}</Notice>}
      {isLoading && <p className="text-ink-soft">Loading…</p>}
      {!isLoading && !error && items.length === 0 && (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-bg p-10 text-center text-ink-soft">
          No {status || ''} enquiries yet.
        </p>
      )}
      <ul className="grid gap-3">
        {items.map((e) => (
          <li key={e.id} className="rounded-[var(--radius-card)] border border-line bg-bg p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {e.name}
                  {e.status === 'new' && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-ink">New</span>}
                </p>
                <p className="text-sm text-ink-soft">
                  {when(e.createdAt)}
                  {e.location && ` · ${e.location}`}
                  {e.projectType && ` · ${e.projectType}`}
                </p>
              </div>
              <select
                value={e.status}
                onChange={(ev) => update.mutate({ id: e.id, status: ev.target.value })}
                className="rounded-lg border border-line bg-bg px-3 py-1.5 text-sm"
                aria-label={`Status for ${e.name}`}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            {e.message && <p className="mt-3 whitespace-pre-line">{e.message}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:+91${e.phone}`} className="rounded-full border border-line px-4 py-1.5 text-sm font-medium hover:bg-bg-soft">Call {e.phone}</a>
              <a
                href={`https://wa.me/91${e.phone}?text=${encodeURIComponent(`Namaste ${e.name}, thank you for contacting us.`)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#25d366] px-4 py-1.5 text-sm font-medium text-white"
              >
                WhatsApp
              </a>
              {e.email && <a href={`mailto:${e.email}`} className="rounded-full border border-line px-4 py-1.5 text-sm font-medium hover:bg-bg-soft">Email</a>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
