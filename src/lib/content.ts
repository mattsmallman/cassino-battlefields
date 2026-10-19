// Reads the CMS-edited content collections and returns the shapes the pages use.
import { getCollection } from 'astro:content';
import { marked } from 'marked';
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
      groupSize: d.group_size, walking: d.walking, deposit: d.deposit, included: d.included, seo: d.seo_description,
      map: d.map_area ? { bbox: [d.map_area.west, d.map_area.south, d.map_area.east, d.map_area.north] as [number, number, number, number], route: d.map_route, places: d.map_places } : undefined,
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

// ---- Site settings, About and FAQs
export async function getSettings() {
  const s = (await getCollection('settings'))[0].data;
  const tel = (n: string) => '+' + n.replace(/\(0\)/, '').replace(/[^\d]/g, '').replace(/^0/, '44');
  return {
    ...s,
    phones: s.phones.map((p) => ({ ...p, href: 'tel:' + tel(p.number), short: p.number.replace(/^\+44 \(0\)/, '0') })),
    addressLines: s.address.split('\n').map((l) => l.trim()).filter(Boolean),
  };
}
// Markdown written in the CMS (links, lists, tables, emphasis). Content is trusted (site owner only).
export const md = (s: string) => marked.parse(s, { async: false }) as string;
export const mdInline = (s: string) => marked.parseInline(s, { async: false }) as string;
export async function getAbout() {
  const d = (await getCollection('about'))[0].data;
  return { ...d, lead: { id: keyFor(d.lead_image), cap: d.lead_caption } };
}
export async function getFaqs() {
  const d = (await getCollection('faqs'))[0].data;
  return { ...d, img: d.image ? { id: keyFor(d.image), cap: d.image_caption } : undefined };
}

// ---- Every other page and the shared wording
type PageName = 'home' | 'toursPage' | 'military' | 'tracing' | 'testimonialsPage' | 'galleryPage' | 'reading' | 'contact' | 'notFound';
export async function getPage<N extends PageName>(name: N) {
  return (await getCollection(name))[0].data as Awaited<ReturnType<typeof getCollection<N>>>[number]['data'];
}
export async function getWording() { return (await getCollection('wording'))[0].data; }
// Fill {tokens} in editable text, e.g. fill('Read all {count} testimonials', { count: 133 }).
export const fill = (s: string | undefined, v: Record<string, string | number> = {}) =>
  (s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in v ? String(v[k]) : m));
// Testimonials chosen by file name in the CMS; missing ones are skipped.
export async function getQuotesById(ids: string[]) {
  const all = await getCollection('testimonials');
  return ids.map((id) => all.find((e) => e.id === id)?.data).filter((x): x is NonNullable<typeof x> => !!x);
}
export const imageRef = (path: string, cap = '') => ({ id: keyFor(path), cap });
