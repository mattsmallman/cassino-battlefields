// Content collections edited through the CMS at /admin. A malformed edit fails
// the build here, so a bad save can never reach the live site.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const imagePath = z.string().regex(/^\/img\//, 'Images must be chosen from the media library');
const photo = z.object({ image: imagePath, caption: z.string().nullish().transform((v) => v ?? '') });
// The CMS may save an empty optional field as '', null or leave it out; treat all as empty.
const opt = z.string().nullish().transform((v) => v ?? '');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a date like 2027-05-12').or(z.literal('')).nullish().transform((v) => v ?? '');
const optNum = z.number().int().positive().nullish().transform((v) => v ?? null);

const tours = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tours' }),
  schema: z.object({
    order: z.number().int(),
    name: z.string().min(1),
    short: z.string().min(1),
    period: z.string().min(1),
    days: z.number().int().min(1).max(21),
    summary: z.string().min(1),
    next_label: opt,
    next_start: isoDate,
    next_end: isoDate,
    next_note: opt,
    price_twin: optNum,
    price_single: optNum,
    price_basis: z.enum(['B&B', 'half board', 'full board']).default('B&B'),
    excludes: z.string(),
    arrive: z.string(),
    depart: z.string(),
    base: opt,
    coords: z.string(),
    hero_image: imagePath.or(z.literal('')).nullish().transform((v) => v ?? ''),
    hero_caption: opt,
    gallery: opt,
    itinerary: z.array(z.object({ stands: z.array(z.string().min(1)) })).default([]),
    photos: z.array(photo).default([]),
    group_size: opt,
    walking: opt,
    deposit: opt,
    included: z.array(z.string().min(1)).default([]),
    seo_description: opt,
    map_route: z.boolean().default(false),
    map_area: z.object({ west: z.number(), south: z.number(), east: z.number(), north: z.number() })
      .refine((a) => a.west < a.east && a.south < a.north, 'West must be less than east, and south less than north').optional(),
    map_places: z.array(z.object({
      name: z.string().min(1), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
      kind: z.enum(['airport', 'base', 'place']).default('place'),
      label: z.enum(['right', 'left', 'below-right', 'below-left']).default('right'),
    })).default([]),
  }).refine((t) => !t.next_end || t.next_start <= t.next_end, { message: 'The end date is before the start date', path: ['next_end'] }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/testimonials' }),
  schema: z.object({
    order: z.number().default(999),
    quote: z.string().min(1),
    name: opt,
    from: opt,
    military: z.boolean().default(false),
    tours: z.array(z.string()).default([]),
  }),
});

const galleries = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/galleries' }),
  schema: z.object({ title: z.string(), order: z.number().default(99), show_on_gallery_page: z.boolean().default(false), photos: z.array(photo) }),
});

const books = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/books' }),
  schema: z.object({ title: z.string(), order: z.number().default(1), books: z.array(z.object({ title: z.string().min(1), author: opt })) }),
});

const stands = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/stands' }),
  schema: z.object({
    status: z.enum(['draft', 'confirmed']),
    note: opt,
    outside: opt,
    bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    tiles: z.string(),
    terrain: z.string(),
    stands: z.array(z.object({
      day: z.number().int().min(1),
      name: z.string().min(1),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      text: opt,
    })),
  }),
});

const settings = defineCollection({
  loader: glob({ pattern: 'site.json', base: './src/content/settings' }),
  schema: z.object({
    business_name: z.string().min(1),
    home_title: opt,
    tagline: opt,
    footer_blurb: opt,
    email: z.string().email('Enter a valid email address'),
    phones: z.array(z.object({ label: opt, number: z.string().regex(/^[+\d][\d ()]{6,}$/, 'Use digits, spaces, brackets and an optional leading +') })).default([]),
    address: opt,
    facebook_url: z.string().url().or(z.literal('')).nullish().transform((v) => v ?? ''),
    facebook_label: opt,
    company_name: z.string().min(1),
    company_number: opt,
    footer_note: opt,
    navigation: z.array(z.object({ label: z.string().min(1), link: z.string().min(1) })).default([]),
    enquire_label: opt,
    enquire_link: opt,
    footer_contact_heading: opt,
    footer_tours_heading: opt,
  }),
});

const about = defineCollection({
  loader: glob({ pattern: 'about.json', base: './src/content/pages' }),
  schema: z.object({
    heading: z.string().min(1),
    seo_description: z.string().min(1).max(300),
    lead_image: imagePath,
    lead_caption: opt,
    lede: z.string().min(1),
    body: opt,
    research: z.array(z.object({ year: z.string().min(1), text: z.string().min(1) })).default([]),
    gallery_heading: opt,
    gallery: opt,
    contact_button: opt,
    title: opt,
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: 'faqs.json', base: './src/content/pages' }),
  schema: z.object({
    title: opt,
    heading: z.string().min(1),
    seo_description: z.string().min(1).max(300),
    image: imagePath.or(z.literal('')).nullish().transform((v) => v ?? ''),
    image_caption: opt,
    faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(1),
  }),
});

// ---- Single-file pages. Text fields may contain {tokens}; see CMS.md.
const str = z.string().min(1);
const quoteRef = z.string().min(1); // testimonial file name, e.g. 001-bill-vodra
const page = (file: string, shape: z.ZodRawShape) => defineCollection({
  loader: glob({ pattern: `${file}.json`, base: './src/content/pages' }),
  schema: z.object({ title: opt, seo_description: str, ...shape }),
});
const home = page('home', {
  hero_image: imagePath, hero_alt: opt, hero_place: opt, hero_coords: opt, hero_heading: str, hero_text: opt,
  hero_primary_label: opt, hero_secondary_label: opt,
  departures_heading: str, departures_link_label: opt, departures_note: opt,
  approach_heading: opt, approach_lede: opt, approach_body: opt,
  campaigns_heading: opt, quotes_heading: opt, quotes_link_label: opt, featured_quotes: z.array(quoteRef).default([]),
  military_heading: opt, military_text: opt, military_button: opt, military_quote: opt,
  books_heading: opt, books_intro: opt,
  books: z.array(z.object({ image: imagePath, title: str, isbn: opt })).default([]),
  books_isbn_label: opt, archive_heading: opt, archive_link_label: opt, archive_gallery: opt,
});
const toursPage = page('tours', { heading: str, lede: opt, itineraries_heading: opt, private_heading: opt, private_text: opt, private_button: opt });
const military = page('military', {
  heading: str, lede: opt, body: opt, image: imagePath, image_caption: opt,
  steps_heading: opt, steps: z.array(z.object({ title: opt, text: str })).default([]),
  quotes_heading: opt, quotes_link_label: opt, featured_quotes: z.array(quoteRef).default([]),
  units_heading: opt, units_count: z.number().int().min(0).default(18), form_heading: opt,
});
const tracing = page('tracing', {
  heading: str, image: imagePath, image_caption: opt, lede: opt, body: opt, quote: opt,
  helps_heading: opt, helps: opt, form_heading: opt, families_heading: opt, family_quotes: z.array(quoteRef).default([]),
});
const testimonialsPage = page('testimonials', { heading: str, lede: opt, gallery: opt, filter_all: str, filter_military: str, filter_private: str });
const galleryPage = page('gallery', { heading: str, lede: opt, count_label: opt, show_all_label: str, initial_count: z.number().int().min(1).default(24) });
const reading = page('reading', { heading: str, lede: opt, search_label: str, search_placeholder: opt, galleries: z.array(z.string()).default([]) });
const contact = page('contact', { heading: str, intro: opt, email_label: str, phone_label: str, post_label: str, facebook_heading: str, form_heading: opt });
const notFound = page('not-found', { heading: str, text: opt, primary_label: opt, primary_link: opt, secondary_label: opt, secondary_link: opt });

const wording = defineCollection({
  loader: glob({ pattern: 'wording.json', base: './src/content/settings' }),
  schema: z.object({
    tour_page: z.record(z.string(), z.string()),
    departures: z.record(z.string(), z.string()),
    maps: z.record(z.string(), z.string()),
    enquiry: z.object({ room_options: z.array(str), extra_tour_options: z.array(str) }).catchall(z.string()),
    general: z.record(z.string(), z.string()),
  }),
});

export const collections = {
  tours, testimonials, galleries, books, stands, settings, about, faqs, wording,
  home, toursPage, military, tracing, testimonialsPage, galleryPage, reading, contact, notFound,
};
