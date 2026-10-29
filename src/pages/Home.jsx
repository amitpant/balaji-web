import { Link } from 'react-router-dom';
import Section from '../components/Section.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { useAllProjects, useSettings, useTestimonials } from '../api/hooks.js';
import { heroImage } from '../data/sampleProjects.js';
import { coverOf, photo } from '../lib/photo.js';

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
  const site = useSettings();
  const { projects, isSample } = useAllProjects();
  const testimonials = useTestimonials();

  const featured = projects.filter((p) => p.featured);
  const shown = (featured.length ? featured : projects).slice(0, 3);
  const hero = isSample ? heroImage : coverOf(featured[0] || projects[0]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-16 lg:pt-24 lg:pb-28">
        <p className="text-sm font-medium text-accent">Haldwani · Uttarakhand</p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight lg:text-6xl">
          We build homes you will be proud to live in.
        </h1>
        {site.tagline && <p className="mt-5 max-w-xl text-lg text-ink-soft">{site.tagline}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/contact" className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink hover:opacity-90">
            Get a free consultation
          </Link>
          <Link to="/projects" className="rounded-full border border-line px-6 py-3 font-medium hover:bg-bg-soft">
            See our projects
          </Link>
        </div>
        {hero && (
          <img
            src={photo(hero, 1800)}
            alt=""
            className="mt-12 aspect-[16/9] w-full rounded-[var(--radius-card)] bg-bg-soft object-cover"
          />
        )}
      </section>

      <section className="border-y border-line">
        <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {site.stats.slice(0, 3).map((s) => (
            <div key={s.label} className="py-8 sm:px-8 sm:first:pl-0">
              <dt className="text-ink-soft">{s.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {shown.length > 0 && (
        <Section title="Featured projects" intro="A selection of recent work, with the details that matter.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
          <Link to="/projects" className="mt-8 inline-block font-medium text-accent hover:underline">
            See all projects →
          </Link>
        </Section>
      )}

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

      {testimonials.length > 0 && (
        <Section title="What our clients say" soft>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 6).map((t) => (
              <figure key={t.id} className="rounded-[var(--radius-card)] border border-line bg-bg p-6">
                {t.rating && (
                  <p className="text-accent" aria-label={`${t.rating} out of 5`}>
                    {'★'.repeat(t.rating)}
                    <span className="text-line">{'★'.repeat(5 - t.rating)}</span>
                  </p>
                )}
                <blockquote className="mt-3">“{t.text}”</blockquote>
                <figcaption className="mt-4 text-sm text-ink-soft">
                  {t.name}
                  {t.location && `, ${t.location}`}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      <Section soft={testimonials.length === 0}>
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
