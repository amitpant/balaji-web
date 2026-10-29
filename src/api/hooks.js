import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';
import { COMPANY } from '../i18n/strings.js';

// Public data hooks. Everything shown about the business comes from the admin panel;
// nothing is filled in with placeholder or sample values.

export function useAllProjects() {
  const q = useQuery({ queryKey: ['public-projects'], queryFn: () => api('/projects?limit=50') });
  return { projects: q.data?.items || [], isLoading: q.isLoading, isError: q.isError };
}

export function useProject(slug) {
  return useQuery({ queryKey: ['public-project', slug], queryFn: () => api(`/projects/${slug}`), retry: (n, err) => err.status !== 404 && n < 2 });
}

export function useSettings() {
  const q = useQuery({ queryKey: ['public-settings'], queryFn: () => api('/settings'), staleTime: 5 * 60_000 });
  const s = q.data || {};
  return {
    loaded: !q.isLoading,
    name: COMPANY,
    logo: s.logo,
    phone: s.phone,
    whatsapp: s.whatsapp,
    whatsappMessage: s.social?.whatsappMessage,
    email: s.email,
    address: s.address,
    mapUrl: s.mapUrl,
    aboutEn: s.aboutEn,
    aboutHi: s.aboutHi,
    services: s.services || [],
    stats: (s.stats || []).filter((x) => x.label && x.value),
    trustBadges: s.trustBadges || [],
    social: s.social || {},
    marketing: s.marketing || {},
  };
}

export function useTestimonials() {
  const q = useQuery({ queryKey: ['public-testimonials'], queryFn: () => api('/testimonials') });
  return q.data?.items || [];
}
