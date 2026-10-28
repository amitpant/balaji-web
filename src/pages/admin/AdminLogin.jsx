import { Link } from 'react-router-dom';
import { site } from '../../config/site.js';

const field =
  'mt-1.5 w-full rounded-lg border border-line bg-bg px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';

// Phase 1 (P1-5): wire to POST /api/auth/login, then route to the admin dashboard.
export default function AdminLogin() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg-soft px-5">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-line bg-bg p-8">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">
          ← {site.name}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Admin login</h1>
        <form className="mt-6 grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input className={field} type="email" name="email" autoComplete="username" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input className={field} type="password" name="password" autoComplete="current-password" required />
          </label>
          <button type="submit" className="mt-2 rounded-full bg-accent py-3 font-medium text-accent-ink hover:opacity-90">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
