// End-to-end check of the CMS in local-repository mode: loads the editor against a
// copy of src/content held in the browser's private file system, edits a tour and
// adds a testimonial, then writes what the CMS saved to <outdir>. Needs `npm run dev
// -- --port 4400` running, and Playwright with Chromium.
// Usage: node tools/cms-e2e.mjs <outdir>
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const out = process.argv[2], repo = new URL('..', import.meta.url).pathname;
const files = {};
const walk = (d) => fs.readdirSync(path.join(repo, d), { withFileTypes: true }).forEach((e) => {
  const rel = path.join(d, e.name); if (e.isDirectory()) walk(rel); else files[rel] = fs.readFileSync(path.join(repo, rel), 'utf8');
});
walk('src/content'); files['.git/HEAD'] = 'ref: refs/heads/main\n'; files['public/admin/config.yml'] = fs.readFileSync(repo + '/public/admin/config.yml', 'utf8'); 
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const ctx = await b.newContext({ viewport: { width: 1360, height: 900 } });
const p = await ctx.newPage();
const logs = []; p.on('console', (m) => ['error'].includes(m.type()) && logs.push(m.text().slice(0, 300))); p.on('pageerror', (e) => logs.push('pageerror: ' + e));
await p.goto('http://127.0.0.1:4400/robots-not-there', { waitUntil: 'domcontentloaded' });
await p.evaluate(async (files) => {
  const root = await navigator.storage.getDirectory();
  for await (const [n] of root.entries()) await root.removeEntry(n, { recursive: true });
  for (const [rel, body] of Object.entries(files)) {
    const parts = rel.split('/'); let dir = root;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
    const fh = await dir.getFileHandle(parts.at(-1), { create: true }); const w = await fh.createWritable(); await w.write(body); await w.close();
  }
}, files);
await p.addInitScript(() => { window.showDirectoryPicker = async () => navigator.storage.getDirectory(); });
await p.goto('http://127.0.0.1:4400/admin/index.html', { waitUntil: 'networkidle' });
await p.getByText('Work with Local Repository').click();
await p.waitForTimeout(5000);
await p.screenshot({ path: `${out}/cms-1-home.png` });
console.log('HOME:', (await p.evaluate(() => document.body.innerText)).slice(0, 500).replace(/\n+/g, ' | '));
console.log('ERRORS:', logs.slice(0, 8));
await ctx.storageState(); 
fs.writeFileSync(out + '/cms-url.txt', p.url());
await p.goto(p.url().split('#')[0] + '#/collections/tours/entries/gothic-line', { waitUntil: 'networkidle' }).catch(() => {});
await p.waitForTimeout(4000);
await p.screenshot({ path: `${out}/cms-2-tour.png`, fullPage: false });
console.log('TOUR:', (await p.evaluate(() => document.body.innerText)).slice(0, 900).replace(/\n+/g, ' | '));
const price = p.getByRole('spinbutton', { name: 'Price per person sharing (£)' });
await price.fill('449');
await p.getByRole('button', { name: 'Save' }).first().click();
await p.waitForTimeout(3000);
await p.screenshot({ path: `${out}/cms-3-saved.png` });
await p.goto(p.url().split('#')[0] + '#/collections/tours/entries/gothic-line').catch(() => {}); await p.waitForTimeout(3000);
console.log('DATEFIELD', await p.evaluate(() => document.querySelector('[data-key-path="next_start"]')?.outerHTML.slice(0, 1500)));
// date edit
const start = p.locator('section[data-key-path="next_start"] input[type=date]');
await start.fill('2027-03-19');
const end = p.locator('section[data-key-path="next_end"] input[type=date]');
await end.fill('2027-03-22');
await p.getByRole('button', { name: 'Save' }).first().click();
await p.waitForTimeout(2500);
// new testimonial
await p.goto(p.url().split('#')[0] + '#/collections/testimonials/new', { waitUntil: 'networkidle' }).catch(() => {});
await p.waitForTimeout(3000);
await p.locator('section[data-key-path="quote"] textarea').first().fill('A test quote added through the editor.');
await p.getByRole('group', { name: /Name \(with rank/ }).locator('input').first().fill('Test Guest');
await p.getByRole('button', { name: 'Save' }).first().click();
await p.waitForTimeout(3000);
await p.screenshot({ path: `${out}/cms-4-newquote.png` });
const newFiles = await p.evaluate(async () => {
  const root = await navigator.storage.getDirectory();
  const d = await (await (await root.getDirectoryHandle('src')).getDirectoryHandle('content')).getDirectoryHandle('testimonials');
  const res = {}; for await (const [n, h] of d.entries()) if (!/^\d{3}-/.test(n)) res[n] = await (await h.getFile()).text();
  return res;
});
fs.writeFileSync(out + '/new-testimonials.json', JSON.stringify(newFiles, null, 1));
const saved = await p.evaluate(async () => {
  const root = await navigator.storage.getDirectory();
  const d = await (await (await root.getDirectoryHandle('src')).getDirectoryHandle('content')).getDirectoryHandle('tours');
  return await (await (await d.getFileHandle('gothic-line.json')).getFile()).text();
});
fs.writeFileSync(out + '/saved-gothic-line.json', saved);
console.log('ERRORS AFTER SAVE:', logs.slice(2, 10));
await b.close();
