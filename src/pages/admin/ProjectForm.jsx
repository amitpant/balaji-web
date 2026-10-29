import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, uploadImage } from '../../api/client.js';
import { photo, photosOf } from '../../lib/photo.js';
import { Button, Card, Field, Input, Notice, PageHeader, Toggle, inputCls } from './ui.jsx';

const blank = {
  title: '',
  category: '',
  status: '',
  location: '',
  plotAreaSqft: '',
  builtUpAreaSqft: '',
  floors: '',
  costAmount: '',
  costOnRequest: false,
  startDate: '',
  completionDate: '',
  description: '',
  highlights: '',
  videos: '',
  published: false,
  featured: false,
  displayOrder: 0,
};

const fromProject = (p) => ({
  title: p.title || '',
  category: p.category || '',
  status: p.status || '',
  location: p.location || '',
  plotAreaSqft: p.plotAreaSqft ?? '',
  builtUpAreaSqft: p.builtUpAreaSqft ?? '',
  floors: p.floors ?? '',
  costAmount: p.cost?.amountInr ?? '',
  costOnRequest: !!p.cost?.onRequest,
  startDate: p.startDate?.slice(0, 7) || '',
  completionDate: p.completionDate?.slice(0, 7) || '',
  description: p.description || '',
  highlights: (p.highlights || []).join('\n'),
  videos: (p.videos || []).map((id) => `https://youtu.be/${id}`).join('\n'),
  published: !!p.published,
  featured: !!p.featured,
  displayOrder: p.displayOrder ?? 0,
});

const lines = (s) => s.split('\n').map((l) => l.trim()).filter(Boolean);

export default function ProjectForm() {
  const { id } = useParams();
  const existing = useQuery({ queryKey: ['admin-project', id], queryFn: () => api(`/admin/projects/${id}`), enabled: !!id });
  if (id && existing.isLoading) return <p className="text-ink-soft">Loading…</p>;
  if (id && existing.error) return <Notice kind="error">{existing.error.message}</Notice>;
  return <ProjectEditor key={id || 'new'} id={id} project={existing.data} />;
}

function ProjectEditor({ id, project }) {
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInput = useRef(null);

  const [form, setForm] = useState(() => (project ? fromProject(project) : blank));
  const [photos, setPhotos] = useState(() => (project ? photosOf(project) : []));
  const [uploading, setUploading] = useState(0);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function addFiles(files) {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setMessage(null);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name} is larger than 15 MB`);
        const img = await uploadImage(file, 'projects');
        setPhotos((p) => [...p, img]);
      } catch (err) {
        setMessage({ kind: 'error', text: err.message });
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  const move = (i, d) =>
    setPhotos((p) => {
      const next = [...p];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
  const makeCover = (i) => setPhotos((p) => [p[i], ...p.filter((_, j) => j !== i)]);
  const remove = (i) => setPhotos((p) => p.filter((_, j) => j !== i));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage(null);
    const body = {
      title: form.title,
      category: form.category || undefined,
      status: form.status || undefined,
      location: form.location,
      coverImage: photos[0],
      gallery: photos.slice(1),
      videos: lines(form.videos),
      plotAreaSqft: form.plotAreaSqft,
      builtUpAreaSqft: form.builtUpAreaSqft,
      floors: form.floors,
      cost: form.costAmount !== '' || form.costOnRequest ? { amountInr: form.costAmount, onRequest: form.costOnRequest } : undefined,
      startDate: form.startDate,
      completionDate: form.completionDate,
      description: form.description,
      highlights: lines(form.highlights),
      published: form.published,
      featured: form.featured,
      displayOrder: form.displayOrder,
    };
    try {
      await api(isNew ? '/admin/projects' : `/admin/projects/${id}`, { method: isNew ? 'POST' : 'PUT', body });
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['public-projects'] });
      qc.removeQueries({ queryKey: ['admin-project', id] });
      navigate('/admin/projects');
    } catch (err) {
      setErrors(err.fields || {});
      setMessage({ kind: 'error', text: Object.keys(err.fields || {}).length ? 'Please fix the highlighted fields.' : err.message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBusy(false);
    }
  }

  async function destroy() {
    if (!window.confirm(`Delete “${form.title}”? This cannot be undone.`)) return;
    try {
      await api(`/admin/projects/${id}`, { method: 'DELETE' });
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['public-projects'] });
      navigate('/admin/projects');
    } catch (err) {
      setMessage({ kind: 'error', text: err.message });
    }
  }

  const videoError = Object.entries(errors).find(([k]) => k.startsWith('videos'))?.[1];

  return (
    <form onSubmit={save} noValidate>
      <Link to="/admin/projects" className="text-sm text-ink-soft hover:text-ink">← Projects</Link>
      <PageHeader title={isNew ? 'Add project' : 'Edit project'} intro="Only title, category and status are required. Empty fields are hidden on the website." />

      <div className="grid gap-6">
        {message && <Notice kind={message.kind}>{message.text}</Notice>}

        <Card title="Basics">
          <Input label="Project name" placeholder="e.g. 3BHK villa, Kathgodam" value={form.title} onChange={set('title')} error={errors.title} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" error={errors.category}>
              <select className={inputCls(errors.category)} value={form.category} onChange={set('category')}>
                <option value="">Choose…</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="interior">Interior</option>
                <option value="renovation">Renovation</option>
              </select>
            </Field>
            <Field label="Status" error={errors.status}>
              <select className={inputCls(errors.status)} value={form.status} onChange={set('status')}>
                <option value="">Choose…</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </Field>
          </div>
          <Input label="Location" placeholder="e.g. Kathgodam, Haldwani" value={form.location} onChange={set('location')} />
        </Card>

        <Card title="Photos" intro="The first photo is the cover. Use the arrows to change the order.">
          {errors.coverImage && <Notice kind="error">{errors.coverImage}</Notice>}
          {photos.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((img, i) => (
                <li key={img.url} className="overflow-hidden rounded-lg border border-line">
                  <div className="relative aspect-[4/3] bg-bg-soft">
                    <img src={photo(img, 400)} alt="" className="h-full w-full object-cover" />
                    {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-ink">Cover</span>}
                  </div>
                  <div className="flex items-center justify-between px-1 py-1 text-sm">
                    <span className="flex">
                      <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-2 py-1.5 disabled:opacity-30" aria-label="Move earlier">←</button>
                      <button type="button" disabled={i === photos.length - 1} onClick={() => move(i, 1)} className="px-2 py-1.5 disabled:opacity-30" aria-label="Move later">→</button>
                    </span>
                    {i > 0 && <button type="button" onClick={() => makeCover(i)} className="px-1 font-medium text-accent">Cover</button>}
                    <button type="button" onClick={() => remove(i)} className="px-2 py-1.5 text-red-700" aria-label="Remove photo" title="Remove photo">✕</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="rounded-lg border border-dashed border-line p-6 text-center"
          >
            <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
            <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()} disabled={uploading > 0}>
              {uploading > 0 ? `Uploading ${uploading}…` : '+ Add photos'}
            </Button>
            <p className="mt-2 text-sm text-ink-soft">Choose several at once from your phone or computer.</p>
          </div>
        </Card>

        <Card title="Videos" intro="Upload videos to YouTube, then paste the links here, one per line.">
          <Field label="YouTube links" error={videoError}>
            <textarea className={inputCls(videoError)} rows={3} placeholder="https://youtu.be/…" value={form.videos} onChange={set('videos')} />
          </Field>
        </Card>

        <Card title="Details" intro="Leave anything empty that you don’t want to show.">
          <div className="grid gap-5 sm:grid-cols-3">
            <Input label="Plot area (sq ft)" inputMode="numeric" value={form.plotAreaSqft} onChange={set('plotAreaSqft')} error={errors.plotAreaSqft} />
            <Input label="Built-up area (sq ft)" inputMode="numeric" value={form.builtUpAreaSqft} onChange={set('builtUpAreaSqft')} error={errors.builtUpAreaSqft} />
            <Input label="Floors" inputMode="numeric" value={form.floors} onChange={set('floors')} error={errors.floors} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Cost (₹)" inputMode="numeric" placeholder="e.g. 8500000" value={form.costAmount} onChange={set('costAmount')} error={errors['cost.amountInr']} hint="Full amount in rupees" />
            <label className="flex items-center gap-3 self-center pt-6">
              <input type="checkbox" checked={form.costOnRequest} onChange={set('costOnRequest')} className="h-5 w-5 accent-[var(--color-accent)]" />
              Show “Cost on request” instead
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Started" type="month" value={form.startDate} onChange={set('startDate')} error={errors.startDate} />
            <Input label="Completed" type="month" value={form.completionDate} onChange={set('completionDate')} error={errors.completionDate} />
          </div>
          <Field label="Description">
            <textarea className={inputCls()} rows={5} value={form.description} onChange={set('description')} />
          </Field>
          <Field label="Highlights" hint="One per line, e.g. Earthquake-resistant frame">
            <textarea className={inputCls()} rows={3} value={form.highlights} onChange={set('highlights')} />
          </Field>
        </Card>

        <Card title="On the website">
          <Toggle label="Published" hint="Show this project on the website" checked={form.published} onChange={(v) => setForm((f) => ({ ...f, published: v }))} />
          <Toggle label="Featured" hint="Show on the home page" checked={form.featured} onChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
          <Input label="Display order" type="number" value={form.displayOrder} onChange={set('displayOrder')} hint="Lower numbers show first" />
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {!isNew ? <Button type="button" variant="danger" onClick={destroy}>Delete project</Button> : <span />}
          <div className="flex gap-3">
            <Link to="/admin/projects" className="rounded-full border border-line px-5 py-2.5 font-medium hover:bg-bg-soft">Cancel</Link>
            <Button type="submit" disabled={busy || uploading > 0}>{busy ? 'Saving…' : 'Save project'}</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
