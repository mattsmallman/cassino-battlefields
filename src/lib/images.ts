// Every photo lives once in the CMS media library, public/img/library/<name>.<ext>.
// The build (scripts/optimise-uploads.mjs) makes /img/u/<name>-{640,1280,2000}.webp
// and records sizes in src/data/imagemeta.json. Image keys are 'u/<name>'.
import meta from '../data/imagemeta.json';
export type Meta = { w: number; h: number; sizes: number[] };
const all = meta as Record<string, Meta>;
export const keyFor = (path: string): string => {
  const u = path.match(/^\/img\/library\/(.+)\.[a-z0-9]+$/i);
  if (u) {
    const key = 'u/' + u[1].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return all[key] ? key : path; // not optimised yet (dev server running): use the original
  }
  return path;
};
export const metaFor = (key: string): Meta | undefined => all[key];
