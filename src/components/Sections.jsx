import { useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { Icon, Section, Svg } from './ui.jsx';

const serviceIcons = {
  residential: Icon.home,
  commercial: Icon.building,
  interior: Icon.sofa,
  renovation: Icon.tools,
  design: Icon.ruler,
  kitchen: Icon.kitchen,
};

// Services come from admin Settings; if none are chosen yet, they are derived from the
// categories of published projects (which is verified work), so nothing is invented.
export function servicesFor(settings, projects) {
  if (settings.services?.length) return settings.services;
  return [...new Set(projects.map((p) => p.category))].filter((k) => serviceIcons[k]);
}

export function ServicesSection({ keys, projects = [], tone = 'white', id = 'services' }) {
  const { t, num } = useT();
  if (!keys.length) return null;
  return (
    <Section id={id} title={t('services.title')} intro={t('services.intro')} tone={tone}>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {keys.map((k) => {
          const count = projects.filter((p) => p.category === k).length;
          return (
            <li key={k} className="rounded-xl border border-line bg-paper p-6">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-charcoal text-orange">
                <Svg size={24}>{serviceIcons[k]}</Svg>
              </span>
              <h3 className="mt-5 text-lg font-semibold">{t(`services.items.${k}.title`)}</h3>
              <p className="mt-1.5 text-muted">{t(`services.items.${k}.text`)}</p>
              {count > 0 && <p className="mt-4 text-sm font-medium text-orange-ink">{count === 1 ? t('services.projectsInOne') : t('services.projectsIn', { n: num(count) })}</p>}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function ProcessSection({ tone = 'dark' }) {
  const { t, num } = useT();
  const steps = t('process.steps');
  return (
    <Section id="process" title={t('process.title')} intro={t('process.intro')} tone={tone}>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="relative rounded-xl border border-paper/15 bg-charcoal-2/60 p-6">
            <span className="text-4xl font-bold text-orange" aria-hidden="true">
              {num(i + 1, { minimumIntegerDigits: 2 })}
            </span>
            <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-on-dark-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function FaqSection({ tone = 'paper' }) {
  const { t } = useT();
  const items = t('faq.items');
  const [open, setOpen] = useState(0);
  return (
    <Section id="faq" title={t('faq.title')} tone={tone}>
      <div className="max-w-3xl divide-y divide-line rounded-xl border border-line bg-white">
        {items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold hover:text-orange-ink"
                >
                  {f.q}
                  <Svg className={`shrink-0 transition-transform ${isOpen ? 'rotate-45 text-orange-ink' : ''}`}>{Icon.plus}</Svg>
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!isOpen} className="px-5 pb-5 text-muted">
                {f.a}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function TestimonialsSection({ items }) {
  const { t } = useT();
  if (!items.length) return null;
  return (
    <Section id="testimonials" title={t('testimonials.title')} tone="sage">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((r) => (
          <figure key={r.id} className="rounded-xl border border-line bg-white p-6">
            {r.rating && (
              <p className="text-orange-ink" role="img" aria-label={t('testimonials.rating', { n: r.rating })}>
                {'★'.repeat(r.rating)}
                <span className="text-line">{'★'.repeat(5 - r.rating)}</span>
              </p>
            )}
            <blockquote className="mt-3 text-lg">“{r.text}”</blockquote>
            <figcaption className="mt-4 text-sm text-muted">
              {r.name}
              {r.location && `, ${r.location}`}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function StatsStrip({ stats }) {
  const { t } = useT();
  if (!stats.length) return null;
  return (
    <section aria-label={t('stats.title')} className="border-b border-line bg-white">
      <dl className={`mx-auto grid max-w-6xl divide-y divide-line px-5 sm:divide-x sm:divide-y-0 ${['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3'][Math.min(stats.length, 3)]}`}>
        {stats.slice(0, 3).map((s) => (
          <div key={s.label} className="flex flex-col-reverse py-7 sm:px-8 sm:first:pl-0">
            <dt className="text-muted">{s.label}</dt>
            <dd className="text-3xl font-bold tracking-tight text-orange-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
