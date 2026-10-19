// End-to-end check of the Pages and Site settings forms (see tools/cms-e2e.mjs for setup).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const out = process.argv[2], repo = new URL('..', import.meta.url).pathname;
const files = {};
const walk = (d) => fs.readdirSync(path.join(repo, d), { withFileTypes: true }).forEach((e) => {
  const rel = path.join(d, e.name); if (e.isDirectory()) walk(rel); else files[rel] = fs.readFileSync(path.join(repo, rel), 'utf8');
});
walk('src/content'); files['.git/HEAD'] = 'ref: refs/heads/main\n';
const bins = {}; for (const f of fs.readdirSync(repo + '/public/img/library')) bins['public/img/library/' + f] = fs.readFileSync(repo + '/public/img/library/' + f).toString('base64');
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
const logs = []; p.on('pageerror', (e) => logs.push('pageerror: ' + e));
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
for (const chunk of Object.entries(bins).reduce((a, e, i) => { (a[i >> 4] ??= []).push(e); return a; }, [])) {
  await p.evaluate(async (chunk) => {
    let dir = await navigator.storage.getDirectory();
    for (const x of ['public', 'img', 'library']) dir = await dir.getDirectoryHandle(x, { create: true });
    for (const [rel, b64] of chunk) { const w = await (await dir.getFileHandle(rel.split('/').at(-1), { create: true })).createWritable(); await w.write(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))); await w.close(); }
  }, chunk);
}
await p.addInitScript(() => { window.showDirectoryPicker = async () => navigator.storage.getDirectory(); });
await p.goto('http://127.0.0.1:4400/admin/index.html', { waitUntil: 'networkidle' });
await p.getByText('Work with Local Repository').click(); await p.waitForTimeout(4000);
const base = p.url().split('#')[0];
const read = (rel) => p.evaluate(async (rel) => {
  let d = await navigator.storage.getDirectory(); const parts = rel.split('/');
  for (const x of parts.slice(0, -1)) d = await d.getDirectoryHandle(x);
  return await (await (await d.getFileHandle(parts.at(-1))).getFile()).text();
}, rel);
// 1. FAQs: change heading only, save
await p.goto(base + '#/collections/pages/entries/faqs'); await p.waitForTimeout(3500);
await p.screenshot({ path: `${out}/cms-faqs.png` });
await p.locator('section[data-key-path="heading"] input').first().fill('Questions before you book a tour');
await p.getByRole('button', { name: 'Save' }).first().click(); await p.waitForTimeout(2500);
fs.writeFileSync(`${out}/saved-faqs.json`, await read('src/content/pages/faqs.json'));
// 2. Settings: change a phone number
await p.goto(base + '#/collections/settings/entries/site'); await p.waitForTimeout(3500);
await p.screenshot({ path: `${out}/cms-settings.png` });
await p.locator('section[data-key-path="phones.1.number"] input').first().fill('+44 (0)7700 900123');
await p.getByRole('button', { name: 'Save' }).first().click(); await p.waitForTimeout(2500);
fs.writeFileSync(`${out}/saved-site.json`, await read('src/content/settings/site.json'));
// 3. About: change a research year text
await p.goto(base + '#/collections/pages/entries/about'); await p.waitForTimeout(3500);
await p.screenshot({ path: `${out}/cms-about.png` });
const rf = p.locator('[data-key-path="research.0.text"] input').first(); await p.locator('[data-key-path="research"]').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
console.log('RESEARCH PATHS', await p.evaluate(() => [...document.querySelectorAll('[data-key-path^="research"]')].slice(0, 5).map((e) => e.getAttribute('data-key-path'))));
await rf.fill('Researched for Wall to Wall, producers of the BBC’s *Who Do You Think You Are?* (edited)');
await p.getByRole('button', { name: 'Save' }).first().click(); await p.waitForTimeout(2500);
fs.writeFileSync(`${out}/saved-about.json`, await read('src/content/pages/about.json'));
await p.goto(base + '#/collections/galleries/entries/cassino'); await p.waitForTimeout(5000);
await p.screenshot({ path: `${out}/cms-gallery.png` });
console.log('errors', logs);
await b.close();
