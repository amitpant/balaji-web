import { Link } from 'react-router-dom';
import Section from '../components/Section.jsx';
import { site } from '../config/site.js';

const services = [
  { title: 'Residential construction', text: 'Homes and villas from foundation to finishing.' },
  { title: 'Commercial construction', text: 'Shops, offices and mixed-use buildings.' },
  { title: 'Interior design', text: 'Practical, lasting interiors and modular kitchens.' },
  { title: '3D elevation', text: 'See your building before the first brick.' },
];

const steps = [
  { title: 'Tell us your needs', text: 'Plot, budget and timeline.' },
  { title: 'Approve the design', text: 'Plans and 3D elevation, revised until right.' },
  { title: 'Track progress', text: 'Regular updates with photos from site.' },
  { title: 'Move in', text: 'Handover with a clear warranty.' },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-16 lg:pt-24 lg:pb-28">
        <p className="text-sm font-medium text-accent">Haldwani · Uttarakhand</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight lg:text-6xl">
          We build homes you will be proud to live in.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-soft">{site.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/contact" className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink hover:opacity-90">
            Get a free consultation
          </Link>
          <Link to="/projects" className="rounded-full border border-line px-6 py-3 font-medium hover:bg-bg-soft">
            See our projects
          </Link>
        </div>
        <div className="mt-12 aspect-[16/9] w-full rounded-[var(--radius-card)] bg-bg-soft" aria-hidden="true" />
      </section>

      <section className="border-y border-line">
        <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {site.stats.map((s) => (
            <div key={s.label} className="py-8 sm:px-8 sm:first:pl-0">
              <dt className="text-ink-soft">{s.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Section title="Featured projects" intro="A selection of recent work. Each project lists its area, floors and cost.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="overflow-hidden rounded-[var(--radius-card)] border border-line">
              <div className="aspect-[4/3] bg-bg-soft" />
              <div className="p-5">
                <p className="font-medium">Project coming soon</p>
                <p className="text-sm text-ink-soft">Loaded from the admin panel</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="What we do" soft>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="rounded-[var(--radius-card)] border border-line bg-bg p-6">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How we work">
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="text-sm font-medium text-accent">Step {i + 1}</span>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-1 text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section soft>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">Planning to build?</h2>
            <p className="mt-2 text-ink-soft">Share your plot and budget. We will call you back.</p>
          </div>
          <Link to="/contact" className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink hover:opacity-90">
            Get a free consultation
          </Link>
        </div>
      </Section>
    </>
  );
}
