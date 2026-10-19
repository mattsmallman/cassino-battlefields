// Checks the editor's real-site preview updates live as fields are typed. Needs `npm run dev -- --port 4400`.
// Usage: REPO=<path to this repo> node tools/cms-preview.mjs <outdir>
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const out = process.argv[2], repo = process.env.REPO;
const files = {};
const walk = (d) => fs.readdirSync(path.join(repo, d), { withFileTypes: true }).forEach((e) => {
  const rel = path.join(d, e.name); if (e.isDirectory()) walk(rel); else files[rel] = fs.readFileSync(path.join(repo, rel), 'utf8');
});
walk('src/content'); files['.git/HEAD'] = 'ref: refs/heads/main\n';
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await (await b.newContext({ viewport: { width: 1500, height: 950 } })).newPage();
const logs = []; p.on('console', (m) => ['warning', 'error'].includes(m.type()) && !/404|Failed to load resource/.test(m.text()) && logs.push(m.text().slice(0, 200))); p.on('pageerror', (e) => logs.push('pageerror: ' + e));
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
const open = async (f) => { await p.goto(base + '#/collections/' + f.split('/')[0]); await p.waitForTimeout(700); await p.goto(base + '#/collections/' + f); await p.locator('section[data-key-path]').first().waitFor({ timeout: 15000 }); };
const siteFrame = () => p.frames().filter((f) => f.url().includes('cms-preview') && !f.isDetached()).at(-1);
const waitFrame = async () => { for (let i = 0; i < 40 && !siteFrame(); i++) await p.waitForTimeout(250); const f = siteFrame(); if (f) await f.waitForLoadState('load'); await p.waitForTimeout(1500); return f; };

// Home page
await open('pages/entries/home');
let f = await waitFrame();
console.log('HOME frame:', f?.url());
await p.screenshot({ path: `${out}/pv-home-1.png` });
await p.locator('section[data-key-path="hero_heading"] input').first().fill('Walk the ground and understand the battle.');
await p.waitForTimeout(1200);
console.log('HOME h1 now:', await f.locator('h1').first().innerText());
await p.screenshot({ path: `${out}/pv-home-2.png` });

// Cassino tour: price
await open('tours/entries/cassino');
f = await waitFrame();
console.log('TOUR frame:', f?.url());
const price = p.getByRole('spinbutton', { name: 'Price per person sharing (£)' });
await price.fill('455'); await p.waitForTimeout(1200);
console.log('TOUR price now:', await f.locator('.facts .price').innerText());
await p.locator('section[data-key-path="next_start"] input[type=date]').fill('2027-05-19');
await p.locator('section[data-key-path="next_end"] input[type=date]').fill('2027-05-23'); await p.waitForTimeout(1200);
console.log('TOUR dates now:', await f.locator('.facts dd').first().innerText());
await p.screenshot({ path: `${out}/pv-tour.png` });
// Testimonial quote
await open('testimonials/entries/001-bill-vodra'); f = await waitFrame();
await p.locator('section[data-key-path="quote"] textarea').first().fill('A short test quote typed in the editor.'); await p.waitForTimeout(1200);
console.log('QUOTE frame:', f.url(), '|', await f.locator('[data-cms="testimonials:001-bill-vodra|quote"]').first().innerText());
// FAQ answer (markdown) far down the page
await open('pages/entries/faqs'); f = await waitFrame();
await p.locator('section[data-key-path="heading"] input').first().fill('Before you book');
await p.waitForTimeout(1200);
console.log('FAQ frame:', f.url(), '|', await f.locator('h1').first().innerText() + ' (frames: ' + p.frames().filter((x) => x.url().includes('cms-preview')).map((x) => x.url().replace('http://127.0.0.1:4400', '')).join(', ') + ')');
// Wording: tour page button
await open('settings/entries/wording'); f = await waitFrame();
await p.locator('section[data-key-path="tour_page"] button[aria-label="Expand"]').first().click(); await p.waitForTimeout(500);
await p.locator('section[data-key-path="tour_page.day_by_day_heading"] input').first().fill('The itinerary, day by day'); await p.waitForTimeout(1500);
console.log('WORDING frame:', f.url(), '|', await f.locator('[data-cms="settings:wording|tour_page.day_by_day_heading"]').innerText());
await p.screenshot({ path: `${out}/pv-wording.png` });
// Site settings: phone number on contact page
await open('settings/entries/site'); f = await waitFrame();
await p.locator('section[data-key-path="email"] input').first().fill('bookings@example.com'); await p.waitForTimeout(1200);
console.log('SITE frame:', f.url(), '|', await f.locator('[data-cms="settings:site|email"]').first().innerText());
console.log('LOGS', logs.filter((l) => !/sandbox|WebGL|could not be loaded/.test(l)).slice(0, 10));
await b.close();
