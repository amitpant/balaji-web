import { useRef, useState } from 'react';
import { useSettings } from '../api/hooks.js';
import { api } from '../api/client.js';
import { useT, usePageMeta } from '../i18n/index.jsx';
import { telHref, whatsappHref } from '../lib/contact.js';
import { track } from '../lib/pixel.js';
import { Button, ButtonLink, Icon, Svg, WhatsAppIcon } from '../components/ui.jsx';

const TYPES = ['New house', 'Commercial building', 'Interior work', 'Renovation', 'Design / elevation', 'Other'];
const empty = { name: '', phone: '', email: '', location: '', projectType: '', message: '', website: '' };

const inputCls = (err) =>
  `mt-1.5 block w-full rounded-lg border bg-white px-4 py-3 text-base outline-none focus:border-orange-ink focus:ring-2 focus:ring-orange/30 ${
    err ? 'border-[#b42318]' : 'border-line'
  }`;

// Same rules as the API, checked here first so errors appear in the visitor's language.
function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'name';
  const phone = form.phone.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = 'phone';
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'email';
  return errors;
}

export default function Contact() {
  usePageMeta('contact', '/contact');
  const { t, lang } = useT();
  const site = useSettings();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [formError, setFormError] = useState('');
  const done = useRef(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) {
      document.getElementById(`field-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      await api('/enquiries', { method: 'POST', body: { ...form, source: 'contact', lang } });
      track('Lead');
      setForm(empty);
      setStatus('sent');
      requestAnimationFrame(() => done.current?.focus());
    } catch (err) {
      setStatus('error');
      if (err.status === 400 && err.fields) {
        const mapped = Object.fromEntries(Object.keys(err.fields).filter((k) => ['name', 'phone', 'email'].includes(k)).map((k) => [k, k]));
        setErrors(mapped);
        setFormError(t('contact.errors.fix'));
      } else if (err.status === 429) setFormError(t('contact.errors.rate'));
      else if (err.status === 0) setFormError(t('contact.errors.network'));
      else setFormError(t('contact.errors.server'));
    }
  }

  const tel = telHref(site.phone);
  const wa = whatsappHref(site.whatsapp, site.whatsappMessage || t('contact.whatsappText'));
  const err = (k) =>
    errors[k] && (
      <span id={`${k}-error`} className="mt-1.5 block text-sm font-medium text-[#b42318]">
        {t(`contact.errors.${errors[k]}`)}
      </span>
    );
  const a11y = (k, hint) => ({
    'aria-invalid': !!errors[k],
    'aria-describedby': [errors[k] && `${k}-error`, hint && `${k}-hint`].filter(Boolean).join(' ') || undefined,
    id: `field-${k}`,
  });

  return (
    <>
      <section className="blueprint text-on-dark">
        <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
          <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded bg-orange" />
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{t('contact.title')}</h1>
          <p className="mt-3 max-w-2xl text-lg text-on-dark-muted">{t('contact.intro')}</p>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.5fr_1fr] lg:py-16">
          <div className="rounded-xl border border-line bg-white p-6 sm:p-8">
            {status === 'sent' ? (
              <div ref={done} tabIndex={-1} role="status" className="outline-none">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-sage text-orange-ink">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                </span>
                <p className="mt-5 text-xl font-semibold">{t('contact.sentTitle')}</p>
                <p className="mt-2 text-muted">{t('contact.sentText')}</p>
                <Button type="button" variant="outline" className="mt-6" onClick={() => setStatus('idle')}>
                  {t('contact.another')}
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-5">
                {formError && (
                  <p role="alert" className="rounded-lg border border-[#b42318]/30 bg-[#fef3f2] px-4 py-3 text-[#b42318]">
                    {formError}
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-medium">{t('contact.name')} *</span>
                    <input className={inputCls(errors.name)} value={form.name} onChange={set('name')} autoComplete="name" required {...a11y('name')} />
                    {err('name')}
                  </label>
                  <label className="block">
                    <span className="font-medium">{t('contact.phone')} *</span>
                    <input className={inputCls(errors.phone)} value={form.phone} onChange={set('phone')} type="tel" autoComplete="tel" inputMode="tel" required {...a11y('phone', true)} />
                    <span id="phone-hint" className="mt-1 block text-sm text-muted">{t('contact.phoneHint')}</span>
                    {err('phone')}
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-medium">{t('contact.email')}</span>
                    <input className={inputCls(errors.email)} value={form.email} onChange={set('email')} type="email" autoComplete="email" {...a11y('email')} />
                    {err('email')}
                  </label>
                  <label className="block">
                    <span className="font-medium">{t('contact.location')}</span>
                    <input className={inputCls()} value={form.location} onChange={set('location')} />
                  </label>
                </div>
                <label className="block">
                  <span className="font-medium">{t('contact.type')}</span>
                  <select className={inputCls()} value={form.projectType} onChange={set('projectType')}>
                    <option value="">{t('contact.typeChoose')}</option>
                    {TYPES.map((v) => (
                      <option key={v} value={v}>{t(`contact.types.${v}`)}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="font-medium">{t('contact.message')}</span>
                  <textarea className={inputCls()} value={form.message} onChange={set('message')} rows={4} />
                </label>
                {/* Honeypot: hidden from people, bots fill it */}
                <input type="text" name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <Button type="submit" disabled={status === 'sending'} className="justify-self-start">
                  {status === 'sending' ? t('contact.sending') : t('contact.submit')}
                </Button>
              </form>
            )}
          </div>

          <aside className="self-start rounded-xl bg-charcoal p-6 text-paper sm:p-8">
            <p className="text-lg font-semibold">{t('company')}</p>
            <p className="mt-2 text-on-dark-muted">{t('contact.asideText')}</p>
            {site.address && (
              <p className="mt-3 whitespace-pre-line text-on-dark-muted">
                <span className="sr-only">{t('contact.address')}: </span>
                {site.address}
              </p>
            )}
            {site.mapUrl && (
              <a href={site.mapUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-orange underline-offset-4 hover:underline">
                {t('contact.map')} →
              </a>
            )}
            {(tel || wa || site.email) && (
              <div className="mt-6 grid gap-3">
                {tel && (
                  <ButtonLink href={tel} variant="light" onClick={() => track('Contact', { method: 'call' })}>
                    <Svg>{Icon.phone}</Svg> {t('cta.call')} {site.phone}
                  </ButtonLink>
                )}
                {wa && (
                  <ButtonLink href={wa} target="_blank" rel="noreferrer" className="!bg-[#1f8a4c] !text-white hover:!bg-[#18723e]" onClick={() => track('Contact', { method: 'whatsapp' })}>
                    <WhatsAppIcon size={20} /> {t('cta.chat')}
                  </ButtonLink>
                )}
                {site.email && (
                  <a href={`mailto:${site.email}`} className="text-on-dark-muted hover:text-paper">{site.email}</a>
                )}
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
