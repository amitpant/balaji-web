const icons = {
  facebook: (
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8a0 0 0 0 1 0 0z" />
  ),
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

const labels = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube' };

export default function SocialIcons({ social = {} }) {
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
          aria-label={labels[k]}
          className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-soft hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            {icons[k]}
          </svg>
        </a>
      ))}
    </div>
  );
}
