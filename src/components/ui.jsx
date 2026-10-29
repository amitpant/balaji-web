import { Link } from 'react-router-dom';

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-colors';

const variants = {
  primary: 'bg-orange-ink text-white hover:bg-[#9c4419]',
  dark: 'bg-charcoal text-paper hover:bg-charcoal-2',
  outline: 'border border-charcoal/25 text-charcoal hover:bg-sage',
  light: 'bg-paper text-charcoal hover:bg-white',
  ghostDark: 'border border-paper/30 text-paper hover:bg-paper/10',
};

export function ButtonLink({ to, href, variant = 'primary', className = '', children, ...rest }) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Button({ variant = 'primary', className = '', ...rest }) {
  return <button className={`${base} ${variants[variant]} disabled:opacity-60 ${className}`} {...rest} />;
}

export function Section({ id, title, intro, tone = 'paper', children, className = '', headingLevel = 2 }) {
  const tones = { paper: 'bg-paper', white: 'bg-white', sage: 'bg-sage', dark: 'blueprint text-on-dark' };
  const H = `h${headingLevel}`;
  return (
    <section id={id} className={`${tones[tone]} ${className}`} aria-labelledby={title ? `${id}-title` : undefined}>
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        {title && (
          <div className="max-w-2xl">
            <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded bg-orange" />
            <H id={`${id}-title`} className="text-3xl font-semibold tracking-tight lg:text-4xl">
              {title}
            </H>
            {intro && <p className={`mt-3 text-lg ${tone === 'dark' ? 'text-on-dark-muted' : 'text-muted'}`}>{intro}</p>}
          </div>
        )}
        <div className={title ? 'mt-10 lg:mt-12' : ''}>{children}</div>
      </div>
    </section>
  );
}

export const Icon = {
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  home: <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />,
  building: <path d="M4 21V5l8-2v18M12 21V9l8 2v10M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2M3 21h18" />,
  sofa: <path d="M4 18v-6a2 2 0 0 1 4 0v2h8v-2a2 2 0 0 1 4 0v6zM6 18v2M18 18v2M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />,
  tools: <path d="M14 7l3-3 3 3-3 3M17 10l-9 9-3-3 9-9M5 5l4 4M3 7l4-4" />,
  ruler: <path d="M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2" />,
  kitchen: <path d="M4 4h16v16H4zM4 10h16M9 4v6M8 14h3M14 14h2" />,
  plus: <path d="M12 5v14M5 12h14" />,
};

export function Svg({ children, size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

export const WhatsAppIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2z" />
  </svg>
);
