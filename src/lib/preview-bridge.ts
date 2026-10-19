// Runs only when a page is opened inside the site editor's preview (?cms-preview).
// The editor posts the draft of the entry being edited; every element marked with
// data-cms="<source>|<field path>" for that source is updated to match, using the
// same formatting as the build. Changes to page structure (new items, reordering)
// appear when the entry is saved and the page rebuilds.
import { marked } from 'marked';
import { dateRange, fill, gbp, trimQuote } from './format';

type Msg = { type: 'cms-preview'; source: string; data: Record<string, unknown> };
const get = (obj: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);

function render(el: HTMLElement, value: unknown, data: Record<string, unknown>) {
  const fmt = el.dataset.cmsFormat ?? 'text';
  const vars = el.dataset.cmsVars ? JSON.parse(el.dataset.cmsVars) : {};
  if (fmt === 'img') {
    const img = el as HTMLImageElement;
    if (typeof value === 'string' && value && img.dataset.cmsSrc !== value) {
      img.dataset.cmsSrc = value; img.removeAttribute('srcset'); img.src = value; changed.push(img);
    }
    return;
  }
  let out: string;
  switch (fmt) {
    case 'dates': out = data.next_start ? dateRange(String(data.next_start), String(data.next_end ?? '')) : String(data.next_note ?? ''); break;
    case 'gbp': out = typeof value === 'number' ? gbp(value) : ''; break;
    case 'quote': out = `‘${trimQuote(String(value ?? ''), vars.max)}’`; break;
    case 'md': case 'mdinline': {
      const html = (fmt === 'md' ? marked.parse(String(value ?? ''), { async: false }) : marked.parseInline(String(value ?? ''), { async: false })) as string;
      if (el.innerHTML !== html) { el.innerHTML = html; changed.push(el); }
      return;
    }
    default: out = fill(String(value ?? ''), vars);
  }
  // A blank "name shown" falls back to the tour name, as on the site.
  if (!out && el.dataset.cms?.endsWith('|next_label')) out = String(data.name ?? '');
  if (el.textContent !== out) { el.textContent = out; changed.push(el); }
}
let changed: HTMLElement[] = [];

let first = true;
function apply(msg: Msg) {
  changed = [];
  document.querySelectorAll<HTMLElement>('[data-cms]').forEach((el) => {
    const [source, path] = el.dataset.cms!.split('|');
    if (source !== msg.source) return;
    render(el, path === 'next' ? null : get(msg.data, path), msg.data);
  });
  // Show what just changed: scroll to it and highlight it briefly.
  if (!first && changed.length) {
    const el = changed[0];
    const r = el.getBoundingClientRect();
    if (r.top < 60 || r.bottom > innerHeight - 20) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    changed.forEach((c) => { c.style.outline = '3px solid #007236'; c.style.outlineOffset = '3px'; clearTimeout((c as any)._t); (c as any)._t = setTimeout(() => { c.style.outline = ''; c.style.outlineOffset = ''; }, 1200); });
  }
  first = false;
}

// Banner explaining what updates live.
const bar = document.createElement('div');
bar.textContent = 'Preview: text updates as you type. New items, reordering and layout changes appear after you save.';
bar.setAttribute('style', 'position:relative;z-index:9999;background:#1d2420;color:#fff;font:600 13px/1.4 system-ui,sans-serif;padding:8px 14px;text-align:center;opacity:.92');
document.body.prepend(bar);
document.querySelectorAll('a[href^="/"]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

window.addEventListener('message', (e) => {
  if (e.origin !== location.origin || (e.data as Msg)?.type !== 'cms-preview') return;
  apply(e.data as Msg);
});
window.parent.postMessage({ type: 'cms-preview-ready' }, location.origin);
