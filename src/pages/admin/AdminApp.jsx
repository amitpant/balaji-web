import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import AdminLogin from './AdminLogin.jsx';
import ProjectsAdmin from './ProjectsAdmin.jsx';
import ProjectForm from './ProjectForm.jsx';
import EnquiriesAdmin from './EnquiriesAdmin.jsx';
import ReviewsAdmin from './ReviewsAdmin.jsx';
import SocialAdmin from './SocialAdmin.jsx';
import SettingsAdmin from './SettingsAdmin.jsx';

const icon = {
  projects: <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />,
  enquiries: <path d="M4 5h16v11H8l-4 4zM8 9h8M8 12h5" />,
  reviews: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />,
  social: <path d="M18 8a3 3 0 1 0-3-3M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />,
  settings: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 13.7H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10.3 3V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 17 4.6l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 10.3h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6.7z" />,
};

const tabs = [
  { to: 'projects', label: 'Projects', icon: icon.projects },
  { to: 'enquiries', label: 'Enquiries', icon: icon.enquiries, badge: true },
  { to: 'reviews', label: 'Reviews', icon: icon.reviews },
  { to: 'social', label: 'Social media', short: 'Social', icon: icon.social },
  { to: 'settings', label: 'Settings', icon: icon.settings },
];

function Shell({ user, children }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: enq } = useQuery({ queryKey: ['admin-enquiries', 'new-count'], queryFn: () => api('/admin/enquiries?status=new&limit=1'), refetchInterval: 60_000 });
  const newCount = enq?.newCount || 0;

  async function logout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    // Drop cached admin data, then re-check the session so the login screen shows.
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
    navigate('/admin');
    await qc.resetQueries({ queryKey: ['me'] });
  }

  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] ${isActive ? 'bg-bg-soft font-medium text-ink' : 'text-ink-soft hover:text-ink'}`;

  return (
    <div className="min-h-screen bg-bg-soft/40 md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-bg p-4 md:flex">
        <p className="px-3 py-2 font-semibold">Admin</p>
        <nav className="mt-2 grid gap-1" aria-label="Admin">
          {tabs.map((t) => (
            <NavLink key={t.to} to={`/admin/${t.to}`} className={link}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{t.icon}</svg>
              {t.label}
              {t.badge && newCount > 0 && <span className="ml-auto rounded-full bg-accent px-2 text-xs text-accent-ink">{newCount}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto grid gap-1 border-t border-line pt-4 text-sm">
          <a href="/" target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2 text-ink-soft hover:text-ink">View website ↗</a>
          <button onClick={logout} className="rounded-lg px-3 py-2 text-left text-ink-soft hover:text-ink">Log out ({user.name})</button>
        </div>
      </aside>

      <header className="flex h-14 items-center justify-between border-b border-line bg-bg px-4 md:hidden">
        <p className="font-semibold">Admin</p>
        <div className="flex gap-4 text-sm">
          <a href="/" target="_blank" rel="noreferrer" className="text-ink-soft">Website ↗</a>
          <button onClick={logout} className="text-ink-soft">Log out</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-bg md:hidden" aria-label="Admin tabs">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={`/admin/${t.to}`}
            className={({ isActive }) => `relative flex flex-col items-center gap-1 py-2.5 text-[11px] ${isActive ? 'text-accent' : 'text-ink-soft'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{t.icon}</svg>
            {t.short || t.label}
            {t.badge && newCount > 0 && <span className="absolute top-1.5 right-[calc(50%-18px)] h-2 w-2 rounded-full bg-accent" />}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function AdminApp() {
  const me = useQuery({ queryKey: ['me'], queryFn: () => api('/auth/me'), retry: false });

  if (me.isLoading) return <div className="p-8 text-ink-soft">Loading…</div>;
  if (me.isError) {
    if (me.error.status === 401) return <AdminLogin />;
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="font-semibold">Can’t reach the server</p>
          <p className="mt-1 text-ink-soft">{me.error.message}. Check your internet and try again.</p>
          <button onClick={() => me.refetch()} className="mt-4 font-medium text-accent">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <Shell user={me.data.user}>
      <Routes>
        <Route index element={<Navigate to="/admin/projects" replace />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="projects/new" element={<ProjectForm />} />
        <Route path="projects/:id" element={<ProjectForm />} />
        <Route path="enquiries" element={<EnquiriesAdmin />} />
        <Route path="reviews" element={<ReviewsAdmin />} />
        <Route path="social" element={<SocialAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
        <Route path="*" element={<Navigate to="/admin/projects" replace />} />
      </Routes>
    </Shell>
  );
}
