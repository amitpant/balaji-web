// Returns a resized, auto-format image URL for Cloudinary; other URLs pass through.
export function photo(image, width = 1200) {
  const url = typeof image === 'string' ? image : image?.url;
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // f_auto also converts HEIC uploads from iPhones into a format every browser can show.
    return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
  }
  return url;
}

export const srcSet = (image, widths) => widths.map((w) => `${photo(image, w)} ${w}w`).join(', ');

export const coverOf = (p) => p?.coverImage || p?.gallery?.[0];

// Cover first, then the rest of the gallery without duplicates.
export function photosOf(p) {
  if (!p) return [];
  const list = [coverOf(p), ...(p.gallery || [])].filter(Boolean);
  const seen = new Set();
  return list.filter((i) => (seen.has(i.url) ? false : seen.add(i.url)));
}
