// Image keys: a key K is served as /img/K-{640,1280,2000}.webp.
// Migrated photos: /img/<id>-1280.webp  -> key <id>
// CMS uploads:     /img/uploads/<file>   -> key u/<name> (variants made by scripts/optimise-uploads.mjs)
import legacy from '../data/imagemeta.json';
import uploads from '../data/uploadmeta.json';
export type Meta = { w: number; h: number; sizes: number[] };
const all: Record<string, Meta> = { ...(legacy as any), ...(uploads as any) };
export const keyFor = (path: string): string => {
  const m = path.match(/^\/img\/(.+)-(640|1280|2000)\.webp$/);
  if (m) return m[1];
  const u = path.match(/^\/img\/uploads\/(.+)\.[a-z0-9]+$/i);
  if (u) {
    const key = 'u/' + u[1].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return all[key] ? key : path; // not optimised yet: keep the original path
  }
  return path;
};
export const metaFor = (key: string): Meta | undefined => all[key];
