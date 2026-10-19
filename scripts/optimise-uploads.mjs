// Turns every photo in the CMS media library (public/img/library, including new
// uploads) into responsive WebP variants in public/img/u/, and records their sizes
// for the Img component. Variants are cached between builds.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const src = 'public/img/library', out = 'public/img/u', metaFile = 'src/data/imagemeta.json';
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(path.dirname(metaFile), { recursive: true }); // src/data holds only generated files, so it is absent in a fresh clone
const meta = {};
for (const f of fs.readdirSync(src)) {
  if (!/\.(jpe?g|png|webp|tiff?|heic|avif)$/i.test(f)) continue;
  const name = path.parse(f).name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const img = sharp(path.join(src, f)).rotate();
  const { width: w, height: h } = await img.metadata();
  const sizes = [640, 1280, 2000].filter((s) => s === 640 || s <= Math.max(w, 0));
  for (const s of sizes) {
    const dest = `${out}/${name}-${s}.webp`;
    if (!fs.existsSync(dest)) await sharp(path.join(src, f)).rotate().resize({ width: Math.min(s, w) }).webp({ quality: 78 }).toFile(dest);
  }
  const o = (await img.metadata()).orientation ?? 1;
  const [W, H] = o >= 5 ? [h, w] : [w, h];
  meta['u/' + name] = { w: W, h: H, sizes: sizes.filter((x) => x === 640 || x <= W) };
}
fs.writeFileSync(metaFile, JSON.stringify(meta, null, 1) + '\n');
console.log(`image library: ${Object.keys(meta).length} photo(s) ready`);
