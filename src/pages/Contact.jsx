import { useState } from 'react';
import Section from '../components/Section.jsx';
import { useSettings } from '../api/hooks.js';
import { api, ApiError } from '../api/client.js';
import { track } from '../lib/pixel.js';

const field =
  'mt-1.5 w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
const empty = { name: '', phone: '', location: '', projectType: '', message: '', website: '' };

export default function Contact() {
  const site = useSettings();
  const [form, setForm] = useState(empty);
  const [state, setState] = useState({ status: 'idle', errors: {}, message: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ status: 'sending', errors: {}, message: '' });
    try {
      await api('/enquiries', { method: 'POST', body: { ...form, source: 'contact' } });
      track('Lead');
      setForm(empty);
      setState({ status: 'sent', errors: {}, message: '' });
    } catch (err) {
      const isApi = err instanceof ApiError;
      setState({ status: 'error', errors: isApi ? err.fields : {}, message: err.message });
    }
  }

  const err = (k) => state.errors[k] && <span className="mt-1 block text-sm text-red-700">{state.errors[k]}</span>;
  const cls = (k) => `${field} ${state.errors[k] ? 'border-red-400' : 'border-line'}`;

  return (
    <Section title="Get a free consultation" intro="Tell us about your plan. We usually call back the same day.">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        {state.status === 'sent' ? (
          <div role="status" className="self-start rounded-[var(--radius-card)] border border-accent/30 bg-accent/5 p-8">
            <p className="text-lg font-semibold">Thank you. We have your details.</p>
            <p className="mt-2 text-ink-soft">We will call you back soon. For anything urgent, use the WhatsApp button.</p>
            <button type="button" onClick={() => setState({ status: 'idle', errors: {}, message: '' })} className="mt-5 font-medium text-accent hover:underline">
              Send another request
            </button>
          </div>
        ) : (
          <form className="grid gap-5" onSubmit={submit} noValidate>
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input className={cls('name')} value={form.name} onChange={set('name')} autoComplete="name" required />
              {err('name')}
            </label>
            <label className="block">
              <span className="text-sm font-medium">Phone / WhatsApp</span>
              <input className={cls('phone')} value={form.phone} onChange={set('phone')} type="tel" autoComplete="tel" inputMode="tel" required />
              {err('phone')}
            </label>
            <label className="block">
              <span className="text-sm font-medium">Location of plot</span>
              <input className={cls('location')} value={form.location} onChange={set('location')} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">What do you want to build?</span>
              <select className={cls('projectType')} value={form.projectType} onChange={set('projectType')}>
                <option value="">Choose one (optional)</option>
                <option>New house</option>
                <option>Commercial building</option>
                <option>Interior work</option>
                <option>Renovation</option>
                <option>3D elevation / design</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Message</span>
              <textarea className={cls('message')} value={form.message} onChange={set('message')} rows={4} />
            </label>
            {/* Honeypot: hidden from people, bots fill it */}
            <input type="text" name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            {state.status === 'error' && !Object.keys(state.errors).length && (
              <p role="alert" className="text-red-700">{state.message}</p>
            )}
            <button
              type="submit"
              disabled={state.status === 'sending'}
              className="justify-self-start rounded-full bg-accent px-6 py-3 font-medium text-accent-ink hover:opacity-90 disabled:opacity-60"
            >
              {state.status === 'sending' ? 'Sending…' : 'Request a call back'}
            </button>
          </form>
        )}
        <div className="self-start rounded-[var(--radius-card)] bg-bg-soft p-6">
          <p className="font-semibold">Visit or call</p>
          {site.address && <p className="mt-2 whitespace-pre-line text-ink-soft">{site.address}</p>}
          {site.phone && (
            <p className="mt-4">
              <a href={`tel:${site.phone}`} className="text-accent hover:underline">{site.phone}</a>
            </p>
          )}
          {site.email && (
            <p>
              <a href={`mailto:${site.email}`} className="text-accent hover:underline">{site.email}</a>
            </p>
          )}
          {site.mapUrl && (
            <p className="mt-4">
              <a href={site.mapUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">Open in Google Maps →</a>
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
