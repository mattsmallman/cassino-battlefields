// Overview-map places per tour. Coordinates are town/airport centres (approximate).
export type Place = { name: string; lat: number; lng: number; kind: 'airport' | 'base' | 'place'; dx?: number; dy?: number; anchor?: 'start' | 'end' };
export const overview: Record<string, { bbox: [number, number, number, number]; places: Place[] }> = {
  cassino: { bbox: [11.75, 40.95, 14.35, 42.0], places: [
    { name: 'Rome airports', lat: 41.80, lng: 12.42, kind: 'airport', anchor: 'end', dx: -10 },
    { name: 'Cassino', lat: 41.488, lng: 13.831, kind: 'base' },
    { name: 'Hitler Line', lat: 41.475, lng: 13.69, kind: 'place', anchor: 'end', dx: -10, dy: 14 },
    { name: 'Velletri', lat: 41.687, lng: 12.777, kind: 'place' },
  ] },
  'anzio-and-the-garigliano': { bbox: [11.75, 40.95, 14.2, 42.0], places: [
    { name: 'Rome airports', lat: 41.80, lng: 12.42, kind: 'airport', anchor: 'end', dx: -10 },
    { name: 'Cassino', lat: 41.488, lng: 13.831, kind: 'base' },
    { name: 'Anzio', lat: 41.447, lng: 12.627, kind: 'place', anchor: 'end', dx: -10 },
    { name: 'Campoleone', lat: 41.648, lng: 12.665, kind: 'place' },
    { name: 'Cisterna', lat: 41.591, lng: 12.828, kind: 'place' },
    { name: 'Minturno', lat: 41.263, lng: 13.746, kind: 'place', anchor: 'end', dx: -10 },
  ] },
  'gothic-line': { bbox: [12.2, 43.5, 13.6, 44.2], places: [
    { name: 'Ancona airport', lat: 43.616, lng: 13.362, kind: 'airport', anchor: 'end', dx: -10 },
    { name: 'Montefabbri', lat: 43.83, lng: 12.73, kind: 'base' },
    { name: 'Rimini', lat: 44.06, lng: 12.568, kind: 'place' },
    { name: 'San Marino', lat: 43.936, lng: 12.447, kind: 'place', anchor: 'end', dx: -10 },
    { name: 'Gemmano', lat: 43.905, lng: 12.582, kind: 'place', dy: 16 },
    { name: 'Coriano', lat: 43.968, lng: 12.6, kind: 'place' },
  ] },
  sangro: { bbox: [13.6, 41.8, 14.9, 42.6], places: [
    { name: 'River Sangro', lat: 42.235, lng: 14.505, kind: 'place' },
  ] },
  salerno: { bbox: [14.1, 40.3, 15.3, 41.0], places: [
    { name: 'Naples airport', lat: 40.886, lng: 14.291, kind: 'airport', anchor: 'end', dx: -10 },
    { name: 'Salerno', lat: 40.68, lng: 14.768, kind: 'base' },
    { name: 'Battipaglia', lat: 40.608, lng: 14.98, kind: 'place' },
    { name: 'Altavilla', lat: 40.534, lng: 15.133, kind: 'place' },
    { name: 'Paestum', lat: 40.422, lng: 15.006, kind: 'place', anchor: 'end', dx: -10 },
  ] },
  'rome-to-bologna': { bbox: [10.9, 41.6, 13.0, 44.9], places: [
    { name: 'Rome', lat: 41.80, lng: 12.42, kind: 'airport', anchor: 'end', dx: -10 },
    { name: 'Orvieto', lat: 42.718, lng: 12.111, kind: 'place', anchor: 'end', dx: -10 },
    { name: 'Arezzo', lat: 43.463, lng: 11.88, kind: 'place' },
    { name: 'Florence', lat: 43.77, lng: 11.255, kind: 'place', anchor: 'end', dx: -10 },
    { name: 'Futa Pass', lat: 44.08, lng: 11.28, kind: 'place', anchor: 'end', dx: -10 },
    { name: 'Rimini', lat: 44.06, lng: 12.568, kind: 'place' },
    { name: 'Argenta', lat: 44.61, lng: 11.84, kind: 'place' },
    { name: 'Bologna', lat: 44.535, lng: 11.29, kind: 'airport', anchor: 'end', dx: -10 },
  ] },
};
