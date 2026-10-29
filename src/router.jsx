import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LangProvider } from './i18n/index.jsx';
import SiteLayout from './components/SiteLayout.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Services from './pages/Services.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin is code-split so public pages stay light.
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'));

const pages = [
  { index: true, element: <Home /> },
  { path: 'projects', element: <Projects /> },
  { path: 'projects/:slug', element: <ProjectDetail /> },
  { path: 'services', element: <Services /> },
  { path: 'about', element: <About /> },
  { path: 'contact', element: <Contact /> },
  { path: '*', element: <NotFound /> },
];

const site = (lang) => (
  <LangProvider lang={lang}>
    <SiteLayout />
  </LangProvider>
);

export const router = createBrowserRouter([
  {
    path: '/admin/*',
    element: (
      <Suspense fallback={<div className="p-8 text-muted">Loading…</div>}>
        <AdminApp />
      </Suspense>
    ),
  },
  // Hindi: every page is also available under /hi (e.g. /hi/projects).
  { path: '/hi', element: site('hi'), children: pages },
  { path: '/', element: site('en'), children: pages },
]);
