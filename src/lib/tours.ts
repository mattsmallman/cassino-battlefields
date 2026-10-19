export type Price = { single: number; twin: number; basis: string };
export type Departure = { label: string; start?: string; end?: string; dates: string };
export type Tour = {
  slug: string;
  name: string;
  short: string;
  period: string;
  days: number;
  arrive: string;
  depart: string;
  base?: string;
  hero?: string;
  heroCap?: string;
  summary: string;
  next?: Departure;
  price?: Price;
  excludes: string;
  gallery?: string;
  coords: string;
  itinerary: { n: number; items: string[] }[];
  images: { id: string; cap: string }[];
};

export const gbp = (n: number) => '£' + n.toLocaleString('en-GB');
export const upcoming = (tours: Tour[]) =>
  tours
    .filter((t) => t.next)
    .sort((a, b) => (a.next!.start ?? '9999').localeCompare(b.next!.start ?? '9999'));
