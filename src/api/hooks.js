import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';
import { sampleProjects } from '../data/sampleProjects.js';
import { site as defaults } from '../config/site.js';

// Public data hooks. Until the owner publishes real projects (or if the API is
// unreachable), the site falls back to the sample projects so it never looks empty.

export function useAllProjects() {
  const q = useQuery({
    queryKey: ['public-projects'],
    queryFn: () => api('/projects?limit=50'),
    retry: 0,
  });
  const real = q.data?.items || [];
  const isSample = !q.isLoading && real.length === 0;
  return { projects: isSample ? sampleProjects : real, isSample, isLoading: q.isLoading };
}

export function useProject(slug, isSample) {
  return useQuery({
    queryKey: ['public-project', slug],
    queryFn: () => api(`/projects/${slug}`),
    enabled: !isSample,
    retry: 0,
  });
}

export function useSettings() {
  const q = useQuery({ queryKey: ['public-settings'], queryFn: () => api('/settings'), retry: 0, staleTime: 5 * 60_000 });
  const s = q.data || {};
  const pick = (k) => (s[k] !== undefined && s[k] !== '' ? s[k] : defaults[k]);
  return {
    name: pick('companyName') || defaults.name,
    tagline: pick('tagline'),
    logo: s.logo,
    phone: pick('phone'),
    whatsapp: pick('whatsapp'),
    email: pick('email'),
    address: pick('address'),
    mapUrl: s.mapUrl,
    stats: s.stats?.length ? s.stats : defaults.stats,
    trustBadges: s.trustBadges || [],
    social: s.social || {},
    marketing: s.marketing || {},
  };
}

export function useTestimonials() {
  const q = useQuery({ queryKey: ['public-testimonials'], queryFn: () => api('/testimonials'), retry: 0 });
  return q.data?.items || [];
}
