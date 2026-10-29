import { useRef, useState } from 'react';
import { api, uploadImage } from '../../api/client.js';
import { photo } from '../../lib/photo.js';
import { Button, Card, Field, Input, Notice, PageHeader, inputCls } from './ui.jsx';
import { useSiteSettings } from './useSiteSettings.js';

function PasswordCard() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [state, setState] = useState({ errors: {}, message: null, busy: false });

  async function submit(e) {
    e.preventDefault();
    setState({ errors: {}, message: null, busy: true });
    try {
      await api('/auth/password', { method: 'POST', body: form });
      setForm({ currentPassword: '', newPassword: '' });
      setState({ errors: {}, message: { kind: 'success', text: 'Password changed.' }, busy: false });
    } catch (err) {
      setState({ errors: err.fields || {}, message: Object.keys(err.fields || {}).length ? null : { kind: 'error', text: err.message }, busy: false });
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Card title="Change password">
        {state.message && <Notice kind={state.message.kind}>{state.message.text}</Notice>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} error={state.errors.currentPassword} />
          <Input label="New password" type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} error={state.errors.newPassword} hint="At least 8 characters" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" disabled={state.busy}>{state.busy ? 'Saving…' : 'Change password'}</Button>
        </div>
      </Card>
    </form>
  );
}

export default function SettingsAdmin() {
  const { draft, update, save, errors, message, busy, isLoading, error } = useSiteSettings();
  const logoInput = useRef(null);
  const [logoState, setLogoState] = useState(null);

  if (isLoading || (!draft && !error)) return <p className="text-ink-soft">Loading…</p>;
  if (error) return <Notice kind="error">{error.message}</Notice>;

  const field = (k) => ({ value: draft[k] || '', onChange: (e) => update({ [k]: e.target.value }), error: errors[k] });
  const stats = draft.stats || [];
  const setStat = (i, k, v) => update({ stats: stats.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });

  async function pickLogo(file) {
    if (!file) return;
    setLogoState('Uploading…');
    try {
      update({ logo: await uploadImage(file, 'site') });
      setLogoState(null);
    } catch (err) {
      setLogoState(err.message);
    }
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        noValidate
        className="grid gap-6"
      >
        <PageHeader title="Settings" intro="Company details shown across the website." />
        {message && <Notice kind={message.kind}>{message.text}</Notice>}

        <Card title="Company">
          <Input label="Company name" placeholder="Balaji Construction" {...field('companyName')} />
          <Input label="Tagline" placeholder="Homes and buildings in Haldwani, built with care." {...field('tagline')} />
          <Field label="Logo">
            <div className="mt-1.5 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg border border-line bg-bg-soft">
                {draft.logo ? <img src={photo(draft.logo, 160)} alt="Logo" className="h-full w-full object-contain" /> : <span className="text-xs text-ink-soft">None</span>}
              </div>
              <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={(e) => pickLogo(e.target.files[0])} />
              <Button type="button" variant="secondary" onClick={() => logoInput.current?.click()}>{draft.logo ? 'Change' : 'Upload'}</Button>
              {draft.logo && <button type="button" onClick={() => update({ logo: null })} className="text-sm text-red-700">Remove</button>}
            </div>
            {logoState && <span className="mt-1 block text-sm text-ink-soft">{logoState}</span>}
          </Field>
        </Card>

        <Card title="Contact">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Phone" inputMode="tel" placeholder="+91 98765 43210" {...field('phone')} />
            <Input label="Email" type="email" {...field('email')} />
          </div>
          <Field label="Address">
            <textarea className={inputCls()} rows={2} value={draft.address || ''} onChange={(e) => update({ address: e.target.value })} />
          </Field>
          <Input label="Google Maps link" placeholder="https://maps.app.goo.gl/…" {...field('mapUrl')} hint="Open your office in Google Maps → Share → Copy link." />
        </Card>

        <Card title="Numbers on the home page" intro="Up to 3, e.g. “Projects completed: 140+”.">
          {stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_8rem_auto] items-end gap-3">
              <Input label={i === 0 ? 'Label' : undefined} aria-label="Label" value={s.label} onChange={(e) => setStat(i, 'label', e.target.value)} error={errors[`stats.${i}.label`]} />
              <Input label={i === 0 ? 'Number' : undefined} aria-label="Number" value={s.value} onChange={(e) => setStat(i, 'value', e.target.value)} error={errors[`stats.${i}.value`]} />
              <button type="button" onClick={() => update({ stats: stats.filter((_, j) => j !== i) })} className="pb-3 text-sm text-red-700" aria-label="Remove number">Remove</button>
            </div>
          ))}
          {stats.length < 3 && (
            <button type="button" onClick={() => update({ stats: [...stats, { label: '', value: '' }] })} className="justify-self-start text-sm font-medium text-accent">
              + Add a number
            </button>
          )}
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</Button>
        </div>
      </form>

      <PasswordCard />
    </div>
  );
}
