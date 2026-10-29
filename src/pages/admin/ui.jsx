// Small shared building blocks for admin screens.

export const inputCls = (error) =>
  `mt-1.5 w-full rounded-lg border bg-bg px-3.5 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${
    error ? 'border-red-400' : 'border-line'
  }`;

export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-sm text-red-700">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>
      )}
    </label>
  );
}

export function Input({ label, hint, error, ...props }) {
  return (
    <Field label={label} hint={hint} error={error}>
      <input className={inputCls(error)} {...props} />
    </Field>
  );
}

export function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-line p-4">
      <span>
        <span className="block font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-ink-soft">{hint}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40" />
        <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-accent text-accent-ink hover:opacity-90',
    secondary: 'border border-line bg-bg hover:bg-bg-soft',
    danger: 'border border-red-200 text-red-700 hover:bg-red-50',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-medium disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ title, intro, children }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-bg p-5 sm:p-6">
      {title && <h2 className="font-semibold">{title}</h2>}
      {intro && <p className="mt-1 text-sm text-ink-soft">{intro}</p>}
      <div className={title || intro ? 'mt-5 grid gap-5' : 'grid gap-5'}>{children}</div>
    </section>
  );
}

export function Notice({ kind = 'info', children }) {
  const styles = {
    info: 'border-line bg-bg-soft',
    success: 'border-accent/30 bg-accent/5 text-accent',
    error: 'border-red-200 bg-red-50 text-red-800',
  };
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${styles[kind]}`}>
      {children}
    </p>
  );
}

export function PageHeader({ title, intro, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {intro && <p className="mt-1 text-ink-soft">{intro}</p>}
      </div>
      {action}
    </div>
  );
}
