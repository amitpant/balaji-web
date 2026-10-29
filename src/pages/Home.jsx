import { useAllProjects, useSettings, useTestimonials } from '../api/hooks.js';
import { useT, usePageMeta } from '../i18n/index.jsx';
import { coverOf, photo, srcSet } from '../lib/photo.js';
import ProjectCard from '../components/ProjectCard.jsx';
import { ButtonLink, Section } from '../components/ui.jsx';
import { FaqSection, ProcessSection, ServicesSection, StatsStrip, TestimonialsSection, servicesFor } from '../components/Sections.jsx';
import { Link } from 'react-router-dom';

function Hero({ featured }) {
  const { t, path, num } = useT();
  const cover = coverOf(featured);
  return (
    <section className="blueprint relative overflow-hidden text-on-dark">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-24">
        <div>
          <p className="flex items-center gap-3 text-sm font-semibold tracking-[0.14em] text-orange uppercase">
            <span aria-hidden="true" className="h-0.5 w-10 bg-orange" />
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-5 text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-6xl">{t('company')}</h1>
          <p className="mt-6 max-w-xl text-lg text-on-dark-muted lg:text-xl">{t('hero.sub')}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink to={path('/contact')}>{t('cta.enquire')}</ButtonLink>
            <ButtonLink to={path('/projects')} variant="ghostDark">
              {t('cta.viewProjects')}
            </ButtonLink>
          </div>
        </div>

        {featured && cover && (
          <Link to={path(`/projects/${featured.slug}`)} className="group relative block">
            <span aria-hidden="true" className="absolute -top-3 -left-3 h-24 w-24 border-t-4 border-l-4 border-orange" />
            <span aria-hidden="true" className="absolute -right-3 -bottom-3 h-24 w-24 border-r-4 border-b-4 border-orange" />
            <img
              src={photo(cover, 1200)}
              srcSet={srcSet(cover, [600, 900, 1200, 1600])}
              sizes="(min-width: 1024px) 540px, 100vw"
              alt=""
              fetchPriority="high"
              className="relative aspect-[4/3] w-full rounded-lg object-cover shadow-2xl"
            />
            <span className="absolute right-4 bottom-4 left-4 rounded-lg bg-charcoal/90 px-4 py-3 backdrop-blur">
              <span className="block text-xs font-semibold tracking-wide text-orange uppercase">{t('hero.featured')}</span>
              <span className="mt-0.5 block font-semibold group-hover:underline">{featured.title}</span>
              <span className="block text-sm text-on-dark-muted">
                {[featured.location, featured.builtUpAreaSqft > 0 && t('projects.builtUp', { n: num(featured.builtUpAreaSqft) })].filter(Boolean).join(' · ')}
              </span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta('home', '/');
  const { t, path } = useT();
  const site = useSettings();
  const { projects, isLoading } = useAllProjects();
  const testimonials = useTestimonials();

  const featured = projects.filter((p) => p.featured);
  const shown = (featured.length ? featured : projects).slice(0, 3);

  return (
    <>
      <Hero featured={featured[0] || projects[0]} />
      <StatsStrip stats={site.stats} />

      {(isLoading || shown.length > 0) && (
        <Section id="featured" title={t('projects.featured')} intro={t('projects.featuredIntro')}>
          {isLoading ? (
            <p className="text-muted">{t('projects.loading')}</p>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((p, i) => (
                  <ProjectCard key={p.slug} project={p} eager={i === 0} />
                ))}
              </div>
              <Link to={path('/projects')} className="mt-10 inline-flex items-center gap-2 font-semibold text-orange-ink hover:underline">
                {t('cta.allProjects')} →
              </Link>
            </>
          )}
        </Section>
      )}

      <ServicesSection keys={servicesFor(site, projects)} projects={projects} />
      <ProcessSection />
      <TestimonialsSection items={testimonials} />
      <FaqSection />

      <section className="bg-orange-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">{t('projects.similar')}</h2>
            <p className="mt-2 text-white">{t('contact.intro')}</p>
          </div>
          <ButtonLink to={path('/contact')} variant="light">
            {t('cta.enquire')}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
