# Notes and work still to do

Status at archive (19 October 2026): the full site is built and reviewed locally. It has never been deployed.

## Done

- **Content migrated from WordPress via the REST API, with nothing dropped.** That covers every itinerary line, all 133 testimonials, the general (139) and regimental (115) reading lists, and all 195 photos. A parity check confirmed every itinerary sentence is present.
- **URLs kept.** The tour, about, FAQ, testimonials and contact pages keep their original addresses. nginx redirects the old gallery and reading-list pages and blocks WordPress login and admin paths.
- **New pages:**
  - tours and dates
  - combined gallery
  - military battlefield studies
  - tracing a relative
  - a 404 page
- **Design review applied.**
  - Type moved to Source Serif 4 and Libre Franklin.
  - Contrast now meets WCAG AA.
  - Mobile fixes: the facts box no longer covers the itinerary, and the hero frame no longer overlaps the text.
  - Minimum text sizes are larger.
  - Gallery sections collapse after 24 photos.
- **Original brand green restored** for actions and links.
- **Maps.**
  - Every tour page has a build-time SVG overview map.
  - Cassino has an interactive 3D stand map using self-hosted tiles and terrain, with no third-party requests.
- **Competitor and best-practice sweep done.** Its findings shaped the key-facts box, the military and family pages, and putting testimonials on each tour page.

## Still to do

### Itinerary iconography
- The day-by-day timeline currently marks every stand with the same plain dot. Give each stand a type and a matching icon:
  - viewpoint or orientation stand
  - river crossing
  - CWGC, Polish, German or US cemetery
  - memorial
  - museum
  - walk
  - airport or transfer
- Store the type with each itinerary item in the data rather than guessing it from the text, so Frank can correct it. Use the same icons on the stand-map markers and the overview-map legend.
- Draw the icons as one small custom SVG set in the map-symbol style (thin ink strokes, a poppy fill for cemeteries and memorials) rather than a stock icon font.

### Content for Frank to confirm
- **Cassino dates.** The home page lists "Camino, Garigliano & Cassino" as 12–16 May 2027 (5 days), but the Cassino itinerary is 4 days. Which is right, and does that tour need its own itinerary?
- **Sangro.** There's no itinerary page and no photos. The page currently says the itinerary is sent on request.
- **Salerno.** No 2027 date is listed.
- **Monte Cassino Society logo.** It was on his old home page. Is it a membership or affiliation that should be shown, and on what terms?
- **Walking.** "Light; the minibus is always close by" comes from his FAQ ("No, but where there is, a minibus is provided"). Is that accurate for Cavendish Road and Point 593?
- **Copy edits to check.**
  - GHIC replaces the European Health Insurance Card wording.
  - "IBSN" is corrected to ISBN.
  - "Bombadier" is corrected to Bombardier.
  - Major John Mahony's name was misspelt "Mahoney" on the old About page.
- **Trust account wording.** The FAQ keeps his line that money is held in a trust account. If he wants it, it could name the trustee.

### Maps
- **Cassino stand positions are drafts.** I placed them from place names. Hove Dump and the Amazon Bridge are the least certain. Every point needs Frank's check, ideally against the grid references in his guidebooks. The page shows a "draft" notice until `status` in `src/data/stands-cassino.json` is changed to `confirmed`.
- **Roll out stand maps to Anzio, Salerno and the Gothic Line** once Cassino is confirmed. For each one:
  1. Extract the tiles with `pmtiles extract https://build.protomaps.com/<date>.pmtiles <area>.pmtiles --bbox=… --maxzoom=15`.
  2. Get terrain from the AWS Terrain Tiles bucket (the approach is in the git history: `terrain.py` packed into MBTiles, then `pmtiles convert`).
  3. Write a stands JSON file for the area.
- **Day 4 at Velletri and Monte Artemisio** is outside the Cassino map. Either widen the extract or add a small second map.
- **Possible signature feature:** then-and-now overlays of georeferenced 1944 maps, with an opacity slider. Frank would need to choose and supply the maps. Check the reuse terms of any archive scans first.
- **Overview maps** show town centres only. Rivers, such as the Rapido, Garigliano, Sangro and Marecchia, would help. They aren't in the Natural Earth 1:10m data used now.

### Editing and forms
- **Self-editing for Frank.** The recommended route is a git-backed CMS (Sveltia CMS or Keystatic) over the existing data files: tours, dates and prices, testimonials, stands. Each save commits to this repo and triggers a rebuild. The alternative is a small Laravel and Filament app, which means running a database.
- **Enquiry form.** At the moment it opens the visitor's email app with the details pre-filled. It needs a real handler, for example a small endpoint sending through SES with the domain verified, plus spam protection such as Cloudflare Turnstile.
- **Newsletter or register-interest capture** is not built.

### Other ideas from the competitor sweep
- Add a status to each departure ("places available", "few places left", "full, join the waiting list") once Frank can keep it current.
- Use a third-party review profile (Trustpilot, Feefo or TripAdvisor) alongside his own testimonials.
- Offer online card payment for deposits.
- Write nationality pages (New Zealanders, Poles, Canadians and Americans at Cassino) to win searches from people tracing relatives.

### Technical
- The `tools/` scripts expect the original working layout (`src-scrape/`, `assets-src/`). They're kept as a record of how the migration was done, not as a one-command rebuild. The raw WordPress export is in `archive/wordpress-export/`.
- `public/maps/lib/` is copied from `node_modules/maplibre-gl` on each build (`npm run copy-maplibre`) and is git-ignored.
- The nginx CSP allows `'unsafe-inline'` scripts because Astro inlines small page scripts. Tighten it with hashes if this goes live.
- The repo is about 70 MB, mostly photos and map tiles. Consider Git LFS before adding more map areas.
