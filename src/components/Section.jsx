export default function Section({ title, intro, soft = false, children }) {
  return (
    <section className={soft ? 'bg-bg-soft' : ''}>
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-28">
        {title && <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h2>}
        {intro && <p className="mt-3 max-w-2xl text-ink-soft">{intro}</p>}
        <div className={title || intro ? 'mt-10' : ''}>{children}</div>
      </div>
    </section>
  );
}
