import { useT } from '../i18n/index.jsx';

const icons = {
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8z" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
    </>
  ),
};

export default function SocialIcons({ social = {}, dark = false }) {
  const { t } = useT();
  const links = Object.keys(icons).filter((k) => social[k]);
  if (!links.length) return null;
  return (
    <div className="flex gap-3">
      {links.map((k) => (
        <a
          key={k}
          href={social[k]}
          target="_blank"
          rel="noreferrer"
          aria-label={t(`social.${k}`)}
          className={`grid h-11 w-11 place-items-center rounded-full border ${
            dark ? 'border-paper/25 text-on-dark-muted hover:text-paper' : 'border-line text-muted hover:text-charcoal'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            {icons[k]}
          </svg>
        </a>
      ))}
    </div>
  );
}
