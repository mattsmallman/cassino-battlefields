// Opens every editor form, reports config warnings, and saves edits to new fields.
// Needs `npm run dev -- --port 4400`. Usage: node tools/cms-e2e-all.mjs <outdir>
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const out = process.argv[2], repo = process.env.REPO || new URL('..', import.meta.url).pathname;
const files = {};
const walk = (d) => fs.readdirSync(path.join(repo, d), { withFileTypes: true }).forEach((e) => {
  const rel = path.join(d, e.name); if (e.isDirectory()) walk(rel); else files[rel] = fs.readFileSync(path.join(repo, rel), 'utf8');
});
walk('src/content'); files['.git/HEAD'] = 'ref: refs/heads/main\n';
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
const logs = []; p.on('console', (m) => ['warning', 'error'].includes(m.type()) && !/404|Failed to load resource/.test(m.text()) && logs.push(m.type() + ': ' + m.text().slice(0, 240))); p.on('pageerror', (e) => logs.push('pageerror: ' + e));
await p.goto('http://127.0.0.1:4400/x', { waitUntil: 'domcontentloaded' });
await p.evaluate(async (files) => {
  const root = await navigator.storage.getDirectory();
  for await (const [n] of root.entries()) await root.removeEntry(n, { recursive: true });
  for (const [rel, body] of Object.entries(files)) {
    const parts = rel.split('/'); let dir = root;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
    const w = await (await dir.getFileHandle(parts.at(-1), { create: true })).createWritable(); await w.write(body); await w.close();
  }
}, files);
await p.addInitScript(() => { window.showDirectoryPicker = async () => navigator.storage.getDirectory(); });
await p.goto('http://127.0.0.1:4400/admin/index.html', { waitUntil: 'networkidle' });
await p.getByText('Work with Local Repository').click(); await p.waitForTimeout(4000);
const base = p.url().split('#')[0];
const read = (rel) => p.evaluate(async (rel) => { let d = await navigator.storage.getDirectory(); const parts = rel.split('/'); for (const x of parts.slice(0, -1)) d = await d.getDirectoryHandle(x); return await (await (await d.getFileHandle(parts.at(-1))).getFile()).text(); }, rel);
const forms = ['pages/entries/home', 'pages/entries/tours', 'pages/entries/military', 'pages/entries/tracing', 'pages/entries/testimonials', 'pages/entries/gallery', 'pages/entries/reading', 'pages/entries/contact', 'pages/entries/not-found', 'pages/entries/about', 'pages/entries/faqs', 'settings/entries/site', 'settings/entries/wording', 'tours/entries/cassino'];
const open = async (f) => {
  await p.goto(base + '#/collections/' + f.split('/')[0]); await p.waitForTimeout(800);
  await p.goto(base + '#/collections/' + f);
  await p.locator('section[data-key-path]').first().waitFor({ timeout: 15000 });
  await p.waitForTimeout(800);
};
for (const f of forms) {
  await open(f);
  const keys = await p.evaluate(() => [...new Set([...document.querySelectorAll('section[data-key-path]')].map((e) => e.dataset.keyPath.split('.')[0]))]);
  console.log('FORM', f.padEnd(28), 'fields:', keys.length, keys.slice(0, 6).join(','));
}
await open('pages/entries/home');
await p.screenshot({ path: `${out}/cms-home.png` });
const scrollTo = async (key) => { for (let i = 0; i < 40 && !(await p.locator(`section[data-key-path="${key}"]`).count()); i++) { await p.mouse.move(300, 600); await p.mouse.wheel(0, 700); await p.waitForTimeout(250); } };
await scrollTo('featured_quotes');
console.log('HOME featured quotes shown:', (await p.locator('section[data-key-path="featured_quotes"]').first().innerText()).replace(/\s+/g, ' ').slice(0, 220));
await p.locator('section[data-key-path="featured_quotes"]').first().screenshot({ path: `${out}/cms-featured.png` });
await open('pages/entries/home');
await p.locator('section[data-key-path="hero_heading"] input').first().fill('Walk the ground and understand the battle.');
await p.getByRole('button', { name: 'Save' }).first().click(); await p.waitForTimeout(2500);
fs.writeFileSync(`${out}/saved-home.json`, await read('src/content/pages/home.json'));
await open('settings/entries/wording');
await p.screenshot({ path: `${out}/cms-wording.png` });
await p.locator('section[data-key-path="tour_page"] button[aria-label="Expand"]').first().click();
await p.waitForTimeout(600);
await p.locator('section[data-key-path="tour_page.title_suffix"] input').first().fill('battlefield study');
await p.getByRole('button', { name: 'Save' }).first().click(); await p.waitForTimeout(2500);
fs.writeFileSync(`${out}/saved-wording.json`, await read('src/content/settings/wording.json'));
console.log('WARNINGS/ERRORS:', logs.slice(0, 12));
await b.close();
