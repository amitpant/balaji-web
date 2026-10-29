import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { Button, Card, Field, Input, Notice, PageHeader, Toggle, inputCls } from './ui.jsx';

const blank = { name: '', location: '', text: '', rating: '5', published: true };

export default function ReviewsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-testimonials'], queryFn: () => api('/admin/testimonials') });
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-testimonials'] });
    qc.invalidateQueries({ queryKey: ['public-testimonials'] });
  };

  const open = (t) => {
    setErrors({});
    setEditing(t ? t.id : 'new');
    setForm(t ? { name: t.name, location: t.location || '', text: t.text, rating: String(t.rating || ''), published: t.published } : blank);
  };

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const isNew = editing === 'new';
      await api(isNew ? '/admin/testimonials' : `/admin/testimonials/${editing}`, { method: isNew ? 'POST' : 'PUT', body: form });
      setEditing(null);
      refresh();
    } catch (err) {
      setErrors({ ...err.fields, _: Object.keys(err.fields || {}).length ? null : err.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this review?')) return;
    await api(`/admin/testimonials/${editing}`, { method: 'DELETE' });
    setEditing(null);
    refresh();
  }

  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title="Reviews"
        intro="What clients say about your work. Published reviews appear on the home page."
        action={!editing && <Button onClick={() => open(null)}>+ Add review</Button>}
      />
      {error && <Notice kind="error">{error.message}</Notice>}

      {editing && (
        <form onSubmit={save} className="mb-6" noValidate>
          <Card title={editing === 'new' ? 'New review' : 'Edit review'}>
            {errors._ && <Notice kind="error">{errors._}</Notice>}
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Client name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Input label="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <Field label="What they said" error={errors.text}>
              <textarea className={inputCls(errors.text)} rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
            </Field>
            <Field label="Rating">
              <select className={inputCls()} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                <option value="">No rating</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>
                ))}
              </select>
            </Field>
            <Toggle label="Published" hint="Show on the website" checked={form.published} onChange={(v) => setForm({ ...form, published: v })} />
            <div className="flex flex-wrap justify-between gap-3">
              {editing !== 'new' ? <Button type="button" variant="danger" onClick={remove}>Delete</Button> : <span />}
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save review'}</Button>
              </div>
            </div>
          </Card>
        </form>
      )}

      {isLoading && <p className="text-ink-soft">Loading…</p>}
      {!isLoading && !error && items.length === 0 && !editing && (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-bg p-10 text-center text-ink-soft">
          No reviews yet. Ask a happy client for two lines about their home.
        </p>
      )}
      <ul className="grid gap-3">
        {items.map((t) => (
          <li key={t.id}>
            <button onClick={() => open(t)} className="w-full rounded-[var(--radius-card)] border border-line bg-bg p-5 text-left hover:border-ink-soft/40">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">
                  {t.name}
                  {t.location && <span className="font-normal text-ink-soft">, {t.location}</span>}
                </p>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${t.published ? 'bg-accent/10 text-accent' : 'bg-bg-soft text-ink-soft'}`}>
                  {t.published ? 'Live' : 'Hidden'}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-ink-soft">“{t.text}”</p>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
