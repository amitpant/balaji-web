import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
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

const loading = <div className="p-8 text-ink-soft">Loading…</div>;

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/projects', element: <Projects /> },
      { path: '/projects/:slug', element: <ProjectDetail /> },
      { path: '/services', element: <Services /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin/*',
    element: (
      <Suspense fallback={loading}>
        <AdminApp />
      </Suspense>
    ),
  },
]);
