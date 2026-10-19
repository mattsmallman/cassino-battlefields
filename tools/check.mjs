import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
for (let y = 0; y < 7000; y += 400) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(150); }
await p.waitForLoadState('networkidle');
console.log(await p.evaluate(() => [...document.querySelectorAll('.campaign img')].map(i => [i.currentSrc.slice(-40), i.naturalWidth, i.getBoundingClientRect().height])));
await b.close();
