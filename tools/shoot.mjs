import { chromium } from 'playwright';
const out = process.argv[2]; const pages = process.argv.slice(3);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  for (const path of pages) {
    await p.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 160)); } window.scrollTo(0, 0); });
    await p.waitForLoadState("networkidle"); await p.waitForTimeout(400);
    const name = (path.replace(/\//g, '_') || '_') + '-' + tag + '.jpg';
    await p.screenshot({ path: `${out}/${name}`, fullPage: true, type: 'jpeg', quality: 60 });
    const ow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (ow) console.log('OVERFLOW', path, tag);
  }
}
await b.close();
