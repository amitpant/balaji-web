import { useAllProjects, useSettings } from '../api/hooks.js';
import { useT, usePageMeta } from '../i18n/index.jsx';
import { telHref, whatsappHref } from '../lib/contact.js';
import { coverOf, photo } from '../lib/photo.js';
import { ButtonLink, Section } from '../components/ui.jsx';
import { StatsStrip } from '../components/Sections.jsx';

export default function About() {
  usePageMeta('about', '/about');
  const { t, path, lang } = useT();
  const site = useSettings();
  const { projects } = useAllProjects();
  // About text is written by the owner in admin Settings; Hindi falls back to English text if not provided.
  const about = (lang === 'hi' ? site.aboutHi || site.aboutEn : site.aboutEn) || t('about.intro');
  const image = coverOf(projects.find((p) => p.featured) || projects[0]);
  const tel = telHref(site.phone);
  const wa = whatsappHref(site.whatsapp, site.whatsappMessage || t('contact.whatsappText'));
  const hasDetails = site.address || tel || wa || site.email;

  return (
    <>
      <section className="blueprint text-on-dark">
        <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
          <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded bg-orange" />
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{t('about.title')}</h1>
          <p className="mt-3 text-lg text-on-dark-muted">{t('company')}</p>
        </div>
      </section>
      <StatsStrip stats={site.stats} />
      <Section id="about-body">
        <div className={`grid gap-10 ${image ? 'lg:grid-cols-2' : ''}`}>
          <div>
            <p className="text-lg leading-relaxed whitespace-pre-line">{about}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={path('/projects')} variant="dark">{t('about.projectsLink')}</ButtonLink>
              <ButtonLink to={path('/contact')}>{t('cta.enquire')}</ButtonLink>
            </div>
          </div>
          {image && <img src={photo(image, 1000)} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" />}
        </div>
      </Section>
      {hasDetails && (
        <Section id="company-details" title={t('about.contactTitle')} tone="white">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">{t('company')}</dt>
              <dd className="font-semibold">{site.name}</dd>
            </div>
            {site.address && (
              <div>
                <dt className="text-sm text-muted">{t('contact.address')}</dt>
                <dd className="whitespace-pre-line">{site.address}</dd>
              </div>
            )}
            {tel && (
              <div>
                <dt className="text-sm text-muted">{t('contact.phone')}</dt>
                <dd><a href={tel} className="font-semibold text-orange-ink hover:underline">{site.phone}</a></dd>
              </div>
            )}
            {site.email && (
              <div>
                <dt className="text-sm text-muted">{t('about.email')}</dt>
                <dd><a href={`mailto:${site.email}`} className="font-semibold text-orange-ink hover:underline">{site.email}</a></dd>
              </div>
            )}
          </dl>
        </Section>
      )}
    </>
  );
}
