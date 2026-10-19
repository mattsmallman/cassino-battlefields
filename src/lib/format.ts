// Formatting shared by the site build and the editor's live preview, so both
// produce exactly the same text.
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
// Fill {tokens} in editable text, e.g. fill('Read all {count} testimonials', { count: 133 }).
export const fill = (s: string | undefined | null, v: Record<string, string | number> = {}) =>
  (s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in v ? String(v[k]) : m));
export const gbp = (n: number) => '£' + n.toLocaleString('en-GB');
// Shorten a long testimonial to the last full sentence within max characters.
export function trimQuote(q: string, max?: number) {
  if (!max || q.length <= max) return q;
  const cut = q.slice(0, max);
  return cut.slice(0, cut.lastIndexOf('. ') + 1) || cut + '…';
}
