// Reads the CMS-edited content collections and returns the shapes the pages use.
import { getCollection } from 'astro:content';
import { keyFor } from './images';
import type { Tour } from './tours';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function dateRange(start: string, end: string): string {
  if (!start) return '';
  const [y1, m1, d1] = start.split('-').map(Number);
  if (!end || end === start) return `${d1} ${MONTHS[m1 - 1]} ${y1}`;
  const [y2, m2, d2] = end.split('-').map(Number);
  if (y1 !== y2) return `${d1} ${MONTHS[m1 - 1]} ${y1} – ${d2} ${MONTHS[m2 - 1]} ${y2}`;
  if (m1 !== m2) return `${d1} ${MONTHS[m1 - 1]} – ${d2} ${MONTHS[m2 - 1]} ${y2}`;
  return `${d1}–${d2} ${MONTHS[m1 - 1]} ${y1}`;
}
const pic = (p: { image: string; caption: string }) => ({ id: keyFor(p.image), cap: p.caption });

export async function getTours(): Promise<Tour[]> {
  const today = new Date().toISOString().slice(0, 10);
  const list = (await getCollection('tours')).sort((a, b) => a.data.order - b.data.order);
  return list.map(({ id, data: d }) => {
    // A departure whose end date has passed drops off automatically.
    const live = d.next_start && (d.next_end || d.next_start) >= today;
    const next = live
      ? { label: d.next_label || d.name, start: d.next_start, end: d.next_end || d.next_start, dates: dateRange(d.next_start, d.next_end) }
      : d.next_note ? { label: d.next_label || d.name, dates: d.next_note } : undefined;
    return {
      slug: id, name: d.name, short: d.short, period: d.period, days: d.days, summary: d.summary,
      arrive: d.arrive, depart: d.depart, base: d.base || undefined, coords: d.coords, excludes: d.excludes,
      hero: d.hero_image ? keyFor(d.hero_image) : undefined, heroCap: d.hero_caption || undefined,
      gallery: d.gallery || undefined, next,
      price: d.price_twin && d.price_single ? { twin: d.price_twin, single: d.price_single, basis: d.price_basis } : undefined,
      itinerary: d.itinerary.map((day, i) => ({ n: i + 1, items: day.stands })),
      images: d.photos.map(pic),
    };
  });
}

export async function getTestimonials() {
  return (await getCollection('testimonials')).map((e) => e.data).sort((a, b) => a.order - b.order);
}

export async function getGalleries() {
  const out: Record<string, { id: string; cap: string }[]> = {};
  const meta: { slug: string; title: string; order: number; onPage: boolean }[] = [];
  for (const { id, data } of await getCollection('galleries')) {
    out[id] = data.photos.map(pic);
    meta.push({ slug: id, title: data.title, order: data.order, onPage: data.show_on_gallery_page });
  }
  return { G: out, sections: meta.filter((m) => m.onPage).sort((a, b) => a.order - b.order) };
}

export async function getBooks() {
  return (await getCollection('books')).sort((a, b) => a.data.order - b.data.order).map((e) => ({ slug: e.id, ...e.data }));
}

export async function getStands(slug: string) {
  return (await getCollection('stands')).find((e) => e.id === slug)?.data;
}

// Featured quotes are chosen by name; if one is deleted in the CMS, fall back gracefully.
export const picker = <T extends { name: string }>(list: T[]) => (name: string) => list.find((t) => t.name === name);
