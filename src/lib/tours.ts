import itin from '../data/itineraries.json';

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

const I = itin as Record<string, { days: { n: number; items: string[] }[]; images: { id: string; cap: string }[] }>;

export const tours: Tour[] = [
  {
    slug: 'cassino',
    name: 'Cassino',
    short: 'The four battles for Monte Cassino',
    period: 'January – May 1944',
    days: 4,
    arrive: 'Rome (Ciampino or Fiumicino)',
    depart: 'Rome',
    base: 'Cassino',
    hero: 'abbey-and-polish-cemetery-6a2141',
    heroCap: 'The Abbey from the Polish Cemetery',
    summary:
      'Monte Cassino held up the Allied advance on Rome for five months. We follow the American, British, Indian, New Zealand, Polish and Canadian formations through all four battles: the Rapido crossings, the bombing of the Monastery, Snakeshead Ridge and Point 593, the Cavendish Road, and the final break through the Gustav and Hitler Lines in May 1944.',
    next: { label: 'Camino, Garigliano & Cassino', start: '2027-05-12', end: '2027-05-16', dates: '12–16 May 2027' },
    price: { single: 579, twin: 432, basis: 'B&B' },
    excludes: 'Flights, lunch and evening meals',
    gallery: 'cassino',
    coords: '41°29′N 13°48′E',
    itinerary: I['cassino'].days,
    images: I['cassino'].images,
  },
  {
    slug: 'anzio-and-the-garigliano',
    name: 'Anzio & the Garigliano',
    short: 'The landings, the salient and the breakout',
    period: 'January – May 1944',
    days: 4,
    arrive: 'Rome (Ciampino or Fiumicino)',
    depart: 'Rome',
    hero: 'anzio-3-us-inf-div-ashore-at-anzio-a7e2d5',
    heroCap: '3 US Infantry Division coming ashore at Anzio',
    summary:
      'X Corps crossed the Garigliano in January 1944, and days later VI Corps landed at Anzio to turn the Gustav Line. Neither went to plan. We study the British battalions on the Minturno ridges, the drive on Campoleone and the collapse of the salient, the defence of Buonriposo Ridge and the wadis, and the May breakout that ended with Mark Clark turning for Rome.',
    next: { label: 'Anzio', start: '2027-05-09', end: '2027-05-12', dates: '9–12 May 2027' },
    price: { single: 535, twin: 394, basis: 'B&B' },
    excludes: 'Flights, lunch and evening meals',
    gallery: 'anzio',
    coords: '41°27′N 12°37′E',
    itinerary: I['anzio-and-the-garigliano'].days,
    images: I['anzio-and-the-garigliano'].images,
  },
  {
    slug: 'gothic-line',
    name: 'The Gothic Line',
    short: 'Operation OLIVE on the Adriatic coast',
    period: 'August – September 1944',
    days: 4,
    arrive: 'Ancona',
    depart: 'Ancona',
    base: 'Montefabbri, near Rimini',
    hero: 'view-of-monte-pulito-from-san-marino-nov-17-922507',
    heroCap: 'Monte Pulito from San Marino',
    summary:
      'Eighth Army’s assault on the last great German defensive line in Italy. Working from the hills behind Rimini, we follow the Indian brigades at Tavoleto and San Marino, the long fight for Gemmano and Coriano Ridges, and 4 British Infantry Division’s advance across the Marano to the Marecchia.',
    next: { label: 'The Gothic Line at Rimini', start: '2027-03-12', end: '2027-03-15', dates: '12–15 March 2027' },
    price: { single: 535, twin: 427, basis: 'B&B' },
    excludes: 'Flights, lunch and evening meals',
    gallery: 'gothic-line',
    coords: '43°56′N 12°27′E',
    itinerary: I['gothic-line'].days,
    images: I['gothic-line'].images,
  },
  {
    slug: 'sangro',
    name: 'The Sangro',
    short: 'Eighth Army’s advance to the Sangro',
    period: 'Autumn 1943',
    days: 5,
    arrive: 'On booking',
    depart: 'On booking',
    summary:
      'Eighth Army’s advance up the Adriatic side of Italy in the autumn of 1943 and its battles to force the River Sangro. The full day-by-day itinerary is sent on request.',
    next: { label: 'The Eighth Army Advance to the Sangro', start: '2027-04-23', end: '2027-04-27', dates: '23–27 April 2027' },
    price: { single: 565, twin: 419, basis: 'B&B' },
    excludes: 'Flights, lunch and evening meals',
    coords: '42°13′N 14°30′E',
    itinerary: [],
    images: [],
  },
  {
    slug: 'salerno',
    name: 'Salerno',
    short: 'Operation AVALANCHE',
    period: 'September 1943',
    days: 4,
    arrive: 'Naples (Capodichino)',
    depart: 'Naples',
    base: 'Salerno',
    hero: 'panoramic-view-of-the-vi-us-corps-beaches-from-trentinara-in-dfd70f',
    heroCap: 'The VI (US) Corps beaches from Trentinara',
    summary:
      'The first Allied landing on the Italian mainland came close to being thrown back into the sea. We study the British and American beaches, the Commandos at La Molina and Piegolello, the Guards at the Tobacco Factory, the crisis of 13 September in the Sele–Calore corridor, and the breakout towards Naples.',
    excludes: 'Flights, lunch and evening meals',
    gallery: 'salerno',
    coords: '40°31′N 14°59′E',
    itinerary: I['salerno'].days,
    images: I['salerno'].images,
  },
  {
    slug: 'rome-to-bologna',
    name: 'Rome to Bologna',
    short: 'The Italian Campaign after the fall of Rome',
    period: 'June 1944 – April 1945',
    days: 9,
    arrive: 'Rome (Ciampino or Fiumicino)',
    depart: 'Bologna',
    hero: 'aerial-photo-of-san-marino-2-794798',
    heroCap: 'San Marino from the air',
    summary:
      'Nine days following the Allied armies north from Rome: the Trasimene and Arezzo Lines, the approach to Florence, the winter positions in the Apennines, the Gothic Line at Rimini, and Operation GRAPESHOT through the Argenta Gap in April 1945.',
    next: { label: 'Rome to Bologna', dates: 'On request' },
    price: { single: 1918, twin: 1595, basis: 'half board' },
    excludes: 'Flights and lunch',
    coords: '44°29′N 11°20′E',
    itinerary: I['rome-to-bologna'].days,
    images: I['rome-to-bologna'].images,
  },
];

export const bySlug = (s: string) => tours.find((t) => t.slug === s)!;
export const gbp = (n: number) => '£' + n.toLocaleString('en-GB');
export const upcoming = () =>
  tours
    .filter((t) => t.next)
    .sort((a, b) => (a.next!.start ?? '9999').localeCompare(b.next!.start ?? '9999'));
