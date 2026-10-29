import { useSearchParams } from 'react-router-dom';
import { useAllProjects } from '../api/hooks.js';
import { useT, usePageMeta } from '../i18n/index.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { Section } from '../components/ui.jsx';

const STATUSES = ['completed', 'ongoing', 'upcoming'];
const CATEGORIES = ['residential', 'commercial', 'interior', 'renovation'];

export default function Projects() {
  usePageMeta('projects', '/projects');
  const { t } = useT();
  const { projects, isLoading, isError } = useAllProjects();
  const [params, setParams] = useSearchParams();

  // Only offer tabs and filters that have projects behind them (no empty, dead filters).
  const statuses = STATUSES.filter((s) => projects.some((p) => p.status === s));
  const status = statuses.includes(params.get('status')) ? params.get('status') : statuses[0];
  const inStatus = projects.filter((p) => p.status === status);
  const cats = CATEGORIES.filter((c) => inStatus.some((p) => p.category === c));
  const category = cats.includes(params.get('category')) ? params.get('category') : 'all';
  const list = inStatus.filter((p) => category === 'all' || p.category === category);

  const set = (next) => setParams({ ...Object.fromEntries(params), ...next }, { replace: true });

  return (
    <Section id="projects" title={t('projects.title')} intro={t('projects.intro')} headingLevel={1}>
      {isLoading && <p className="text-muted">{t('projects.loading')}</p>}
      {isError && <p role="alert" className="text-orange-ink">{t('projects.error')}</p>}
      {!isLoading && !isError && projects.length === 0 && (
        <p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">{t('projects.none')}</p>
      )}

      {projects.length > 0 && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {statuses.length > 1 && (
              <div role="group" aria-label={t('facts.status')} className="inline-flex self-start rounded-full border border-line bg-white p-1">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={status === s}
                    onClick={() => set({ status: s, category: 'all' })}
                    className={`min-h-10 rounded-full px-5 text-[15px] ${status === s ? 'bg-charcoal font-semibold text-paper' : 'text-muted hover:text-charcoal'}`}
                  >
                    {t(`projects.${s}`)}
                  </button>
                ))}
              </div>
            )}
            {cats.length > 1 && (
              <div role="group" aria-label={t('nav.services')} className="flex flex-wrap gap-2">
                {['all', ...cats].map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => set({ category: c })}
                    className={`min-h-10 rounded-full border px-4 text-sm ${
                      category === c ? 'border-orange-ink bg-orange-ink/10 font-semibold text-orange-ink' : 'border-line bg-white text-muted hover:text-charcoal'
                    }`}
                  >
                    {c === 'all' ? t('projects.all') : t(`categories.${c}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {list.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p, i) => (
                <ProjectCard key={p.slug} project={p} eager={i < 3} />
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-xl border border-dashed border-line p-10 text-center text-muted">{t('projects.noneFiltered')}</p>
          )}
        </>
      )}
    </Section>
  );
}
