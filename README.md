# Cassino Battlefields website (archived prototype)

A rebuild of [cassinobattlefields.co.uk](https://www.cassinobattlefields.co.uk) as a static Astro site. It was built in October 2026 and then **archived**: Frank isn't ready to move off the current WordPress site, so nothing here is deployed and all staging infrastructure has been removed.

See [NOTES.md](NOTES.md) for what's done and what still needs doing, and [CMS.md](CMS.md) for the site editor, including how to try it locally.

## Run it locally

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
npx http-server dist -p 4321 -c-1   # preview the built site
```

The Cassino 3D map loads its tiles with HTTP range requests. `python3 -m http.server` doesn't support them, so preview with `http-server`, `astro preview` or nginx.

## Layout

| Path | What it is |
| --- | --- |
| `src/pages/` | Page templates (layout only; all text comes from `src/content/`). `[tour].astro` renders every tour at its own URL (`/cassino/`, `/salerno/` …) |
| `src/content/` | **All site text and data**: tours (dates, prices, itineraries, map places), testimonials, galleries, reading lists, stand maps, every page's text, contact details, menu and shared wording. Edited through the CMS at `/admin` |
| `src/content.config.ts` | Build-time rules for that content; a bad edit fails the build |
| `src/lib/content.ts` | Reads the content for the pages; formats dates and drops past departures |
| `public/admin/` | The site editor (Sveltia CMS) and its form configuration |
| `src/components/` | Image, gallery, departures table, enquiry form, overview map (build-time SVG), stand map (MapLibre) |
| `src/styles/global.css` | All styling; colour and type tokens at the top |
| `public/img/library/` | The photo library (195 photos, one file each) and the editor's media folder. Web sizes are generated into `public/img/u/` at build |
| `public/maps/` | Self-hosted Protomaps vector tiles and terrain for the Cassino area, plus map label fonts |
| `deploy/nginx.conf`, `Dockerfile`, `compose.yaml` | Production container: nginx serving `dist/`, old-URL redirects, security headers, a dedicated `cloudflared` sidecar |
| `archive/wordpress-export/` | Raw WordPress REST export (`pages.json`) and the structured blocks extracted from it (`content.json`) |
| `tools/` | Scripts used for the migration and for screenshots (see NOTES.md) |

## Design tokens

- **Green `#007236`**: carried over from the original site. Used for actions, links and focus.
- **Poppy `#b3261e`**: remembrance details only (quote rules, itinerary day labels).
- **Type:** Source Serif 4 for text and headings, Libre Franklin for UI and labels. Both are self-hosted via Fontsource.

## Deploying (if revived)

The compose stack follows the usual SymNex pattern: a git-backed Komodo stack (`run_build: true`, `pull_policy: build`) and its own Cloudflare Tunnel. You'd need to:

1. Create a new tunnel with a public hostname pointing at `http://web:8080`.
2. Set `CF_TUNNEL_TOKEN` in the stack environment.
3. For staging, set `PUBLIC_NOINDEX=1` and `SITE_URL` to the staging URL, and put a Cloudflare Access policy in front of it.

The tunnel, DNS record and Access app used during the prototype have been deleted.
