// One-off: move hand-written data into CMS-editable content collections.
import fs from 'node:fs';
const SP = process.argv[2];
const { tours } = await import(SP + '/tours.mjs');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const T = read('src/data/testimonials.json'), G = read('src/data/galleries.json'), B = read('src/data/books.json'), S = read('src/data/stands-cassino.json');
const img = (id) => `/img/${id}-1280.webp`;
const mk = (d) => fs.mkdirSync(d, { recursive: true });
const w = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n');
const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
mk('src/content/tours'); mk('src/content/testimonials'); mk('src/content/galleries'); mk('src/content/books'); mk('src/content/stands');
tours.forEach((t, i) => {
  const o = {
    order: i + 1, name: t.name, short: t.short, period: t.period, days: t.days,
    summary: t.summary,
    next_label: t.next?.label ?? '', next_start: t.next?.start ?? '', next_end: t.next?.end ?? '', next_note: t.next && !t.next.start ? t.next.dates : '',
    price_twin: t.price?.twin ?? null, price_single: t.price?.single ?? null, price_basis: t.price?.basis ?? 'B&B',
    excludes: t.excludes, arrive: t.arrive, depart: t.depart, base: t.base ?? '', coords: t.coords,
    hero_image: t.hero ? img(t.hero) : '', hero_caption: t.heroCap ?? '',
    gallery: t.gallery ?? '',
    itinerary: t.itinerary.map((d) => ({ stands: d.items })),
    photos: t.images.map((p) => ({ image: img(p.id), caption: p.cap })),
  };
  w(`src/content/tours/${t.slug}.json`, o);
});
T.forEach((t, i) => w(`src/content/testimonials/${String(i + 1).padStart(3, '0')}-${slugify(t.name || 'guest')}.json`,
  { order: i + 1, quote: t.quote, name: t.name, from: t.from, military: t.military, tours: t.tours }));
const gtitles = { cassino: 'Cassino', anzio: 'Anzio & the Garigliano', salerno: 'Salerno', 'gothic-line': 'The Gothic Line', 'rome-to-bologna': 'Rome to Bologna',
  home: 'Home page strip', about: 'About page', testimonials: 'Testimonials page', faqs: 'FAQs page', 'general-reading-list': 'Reading list (general)', 'regiment-core': 'Reading list (regiments)' };
const onPage = ['cassino', 'anzio', 'salerno', 'gothic-line'];
Object.entries(G).forEach(([k, v]) => {
  if (!v.length) return;
  w(`src/content/galleries/${k}.json`, { title: gtitles[k] ?? k, order: onPage.includes(k) ? onPage.indexOf(k) + 1 : 99, show_on_gallery_page: onPage.includes(k), photos: v.map((p) => ({ image: img(p.id), caption: p.cap })) });
});
w('src/content/books/general.json', { title: 'General histories and memoirs', order: 1, books: B.general });
w('src/content/books/regiments.json', { title: 'Regiments and corps', order: 2, books: B.regiments });
w('src/content/stands/cassino.json', { status: S.status, note: S.note, outside: S.outside, bounds: [13.55, 41.33, 14.02, 41.66], tiles: '/maps/cassino.pmtiles', terrain: '/maps/cassino-terrain.pmtiles',
  stands: S.stands.map(({ id, ...s }) => s) });
console.log('done', fs.readdirSync('src/content/testimonials').length, fs.readdirSync('src/content/galleries'));
