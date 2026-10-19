// Turns photos uploaded through the CMS (public/img/uploads) into responsive WebP
// variants in public/img/u/, and records their sizes for the Img component.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const src = 'public/img/uploads', out = 'public/img/u', metaFile = 'src/data/uploadmeta.json';
fs.mkdirSync(out, { recursive: true });
const meta = {};
for (const f of fs.readdirSync(src)) {
  if (!/\.(jpe?g|png|webp|tiff?|heic|avif)$/i.test(f)) continue;
  const name = path.parse(f).name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const img = sharp(path.join(src, f)).rotate();
  const { width: w, height: h } = await img.metadata();
  const sizes = [640, 1280, 2000].filter((s) => s === 640 || s <= w);
  for (const s of sizes) {
    const dest = `${out}/${name}-${s}.webp`;
    if (!fs.existsSync(dest)) await sharp(path.join(src, f)).rotate().resize({ width: Math.min(s, w) }).webp({ quality: 78 }).toFile(dest);
  }
  const rotated = await sharp(path.join(src, f)).rotate().toBuffer({ resolveWithObject: true });
  meta['u/' + name] = { w: rotated.info.width, h: rotated.info.height, sizes };
}
fs.writeFileSync(metaFile, JSON.stringify(meta, null, 1) + '\n');
console.log(`optimised ${Object.keys(meta).length} uploaded image(s)`);
