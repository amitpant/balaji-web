import { useAllProjects, useSettings } from '../api/hooks.js';
import { useT, usePageMeta } from '../i18n/index.jsx';
import { FaqSection, ProcessSection, ServicesSection, servicesFor } from '../components/Sections.jsx';
import { ButtonLink, Section } from '../components/ui.jsx';

export default function Services() {
  usePageMeta('services', '/services');
  const { t, path } = useT();
  const site = useSettings();
  const { projects, isLoading } = useAllProjects();
  const keys = servicesFor(site, projects);

  return (
    <>
      <section className="blueprint text-on-dark">
        <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
          <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded bg-orange" />
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{t('services.title')}</h1>
          <p className="mt-3 max-w-2xl text-lg text-on-dark-muted">{t('services.intro')}</p>
        </div>
      </section>
      {!isLoading && keys.length === 0 && (
        <Section id="services-empty">
          <p className="text-muted">{t('projects.none')}</p>
        </Section>
      )}
      <ServicesSection keys={keys} projects={projects} tone="paper" id="services-list" />
      <ProcessSection />
      <FaqSection tone="white" />
      <Section id="services-cta" tone="sage">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-semibold">{t('projects.similar')}</p>
          <ButtonLink to={path('/contact')}>{t('cta.enquire')}</ButtonLink>
        </div>
      </Section>
    </>
  );
}
