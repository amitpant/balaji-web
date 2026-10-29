import { useT, usePageMeta } from '../i18n/index.jsx';
import { useLocation } from 'react-router-dom';
import { parsePath } from '../i18n/meta.js';
import { ButtonLink } from '../components/ui.jsx';

export default function NotFound() {
  const { t, path } = useT();
  const { basePath } = parsePath(useLocation().pathname);
  usePageMeta('notFound', basePath);
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded bg-orange" />
        <h1 className="text-4xl font-bold tracking-tight">{t('notFound.title')}</h1>
        <p className="mt-3 text-lg text-muted">{t('notFound.text')}</p>
        <ButtonLink to={path('/')} className="mt-8">
          {t('notFound.home')}
        </ButtonLink>
      </div>
    </section>
  );
}
