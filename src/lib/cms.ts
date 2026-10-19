// Marks an element as showing one editable field, so the editor's live preview
// can update it while Frank types. Usage: <h1 {...cms('pages:home', 'hero_heading')}>
// source: '<collection>:<entry>' (e.g. 'tours:cassino', 'settings:wording').
// format: how the preview turns the draft value into what the page shows.
export type CmsFormat = 'text' | 'md' | 'mdinline' | 'gbp' | 'img' | 'quote' | 'dates';
export function cms(source: string, path: string, format: CmsFormat = 'text', vars?: Record<string, string | number>) {
  const a: Record<string, string> = { 'data-cms': `${source}|${path}` };
  if (format !== 'text') a['data-cms-format'] = format;
  if (vars) a['data-cms-vars'] = JSON.stringify(vars);
  return a;
}
