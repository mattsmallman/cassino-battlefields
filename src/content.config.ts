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

export const collections = { tours, testimonials, galleries, books, stands };
