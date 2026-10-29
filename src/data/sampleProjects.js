// DEMO DATA ONLY. Replaced by GET /api/projects in Phase 4.
// Photos: free Unsplash images (Unsplash License), hotlinked and resized by Unsplash.

export const img = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const heroImage = '1600596542815-ffad4c1539a9';

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'interior', label: 'Interior' },
];

export const projects = [
  {
    slug: 'family-home-kathgodam',
    title: 'Family home, Kathgodam',
    category: 'residential',
    status: 'completed',
    location: 'Kathgodam, Haldwani',
    cover: '1580587771525-78b9dba3b914',
    gallery: ['1580587771525-78b9dba3b914', '1583847268964-b28dc8f51f92', '1616047006789-b7af5afb8c20'],
    plotAreaSqft: 2400,
    builtUpAreaSqft: 3100,
    floors: 2,
    cost: { onRequest: true },
    completionDate: '2025-03',
    description:
      'A two-storey family home with a sunlit living room, four bedrooms and a terrace garden. Built on a sloping plot with a reinforced foundation.',
    highlights: ['Earthquake-resistant RCC frame', 'Rainwater harvesting', 'Modular kitchen'],
    featured: true,
  },
  {
    slug: 'villa-rampur-road',
    title: 'Modern villa, Rampur Road',
    category: 'residential',
    status: 'completed',
    location: 'Rampur Road, Haldwani',
    cover: '1613977257363-707ba9348227',
    gallery: ['1613977257363-707ba9348227', '1618221195710-dd6b41faaea6'],
    plotAreaSqft: 3600,
    builtUpAreaSqft: 4200,
    floors: 2,
    cost: { amountInr: 8500000 },
    completionDate: '2024-11',
    description: 'A contemporary villa with large glazing, an open-plan ground floor and a landscaped garden.',
    highlights: ['Double-height living area', 'Solar water heating'],
    featured: true,
  },
  {
    slug: 'twin-homes-unchapul',
    title: 'Twin homes, Unchapul',
    category: 'residential',
    status: 'completed',
    location: 'Unchapul, Haldwani',
    cover: '1628012209120-d9db7abf7eab',
    gallery: ['1628012209120-d9db7abf7eab'],
    builtUpAreaSqft: 2800,
    floors: 2,
    description: 'Two matching homes on adjoining plots, built together to share costs and timelines.',
    featured: true,
  },
  {
    slug: 'residence-kusumkhera',
    title: 'Residence, Kusumkhera',
    category: 'residential',
    status: 'ongoing',
    location: 'Kusumkhera, Haldwani',
    cover: '1721815693498-cc28507c0ba2',
    gallery: ['1721815693498-cc28507c0ba2'],
    plotAreaSqft: 2000,
    floors: 3,
    description: 'A three-storey residence with a rental unit on the ground floor. Structure complete; finishing in progress.',
  },
  {
    slug: 'commercial-complex-nainital-road',
    title: 'Commercial complex, Nainital Road',
    category: 'commercial',
    status: 'ongoing',
    location: 'Nainital Road, Haldwani',
    cover: '1599707254554-027aeb4deacd',
    gallery: ['1599707254554-027aeb4deacd', '1609867271967-a82f85c48531'],
    builtUpAreaSqft: 12000,
    floors: 4,
    description: 'Shops on the ground floor with offices above. Third-floor slab under way.',
  },
  {
    slug: 'apartment-interiors-mukhani',
    title: 'Apartment interiors, Mukhani',
    category: 'interior',
    status: 'completed',
    location: 'Mukhani, Haldwani',
    cover: '1618221195710-dd6b41faaea6',
    gallery: ['1618221195710-dd6b41faaea6', '1616047006789-b7af5afb8c20', '1583847268964-b28dc8f51f92'],
    builtUpAreaSqft: 1450,
    cost: { onRequest: true },
    description: 'Full interiors for a 3BHK apartment: false ceiling, wardrobes, modular kitchen and lighting.',
    highlights: ['Modular kitchen', 'Wardrobes in every bedroom'],
  },
];

export const findProject = (slug) => projects.find((p) => p.slug === slug);
