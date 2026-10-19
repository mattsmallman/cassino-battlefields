# Site editor (Sveltia CMS)

Frank edits the site at `/admin` through forms. Each save is a Git commit to a content file in `src/content/`. When the site rebuilds, `src/content.config.ts` checks every file again, so a malformed edit fails the build and never reaches the live site.

## Try it on your Mac (no sign-in needed)

You need Chrome, Edge or another Chromium browser. Safari and Firefox don't support the local-folder mode.

```bash
git clone https://github.com/mattsmallman/cassino-battlefields
cd cassino-battlefields
npm ci
npm run dev
```

1. Open **http://localhost:4321/admin/index.html**. In dev, use the full path; `/admin/` on its own is caught by the tour-page route. nginx serves both in production.
2. Click **Work with Local Repository** and select the `cassino-battlefields` folder.
3. Edit something and click **Save**. The change is written straight to the file on disk.
4. Open the site in another tab, for example **http://localhost:4321/gothic-line/**. Astro reloads it with your change.
5. Check `git diff`. A typical edit is a one-line change.

Things worth trying:

- **Tours, dates & prices → The Gothic Line:** change the dates or the price, then look at the home page "Next departures" table. Set an end date in the past and the departure drops off the site.
- **Testimonials → New:** add a quote, then tick "From a military unit". It appears on the Testimonials page and in its "Military units" filter.
- **Site settings:** change a phone number or the enquiries email. It updates the header, footer, contact page and the address the enquiry form sends to.
- **Pages → FAQs:** add a question or reword an answer. The cancellation charges are a table; edit it in the editor's source view so the rows stay intact.
- **Photo galleries → Cassino:** drag photos to reorder them, edit a caption, or upload a new photo. Every photo, old and new, lives once in the photo library (`public/img/library/`). The next `npm run dev` or build makes web-sized versions of it; until then the original is shown.
- **Stand maps → cassino:** change a stand's latitude and longitude, or set the status to "Confirmed by Frank" to remove the draft warning from the Cassino page.
- **Pages → Home page:** change the headline, or pick different featured testimonials from the list.
- **Tours → New:** create a tour with a date and two map places. It gets its own page, appears in "Next departures" and joins the footer menu.
- **Site settings → Wording:** change "Book a place" (Tour pages group). Every tour page's button changes.
- **Safety net:** in the raw file, set a price to some text, or an end date before the start date, then run `npm run build`. It fails with a message naming the field.

Run `git restore src/content public/img/library && git clean -fd public/img/library` to throw away test edits.

## What can be edited

Every word on the site comes from an editable content file. Nothing a visitor reads is fixed in the code. The editor's sections are:

| Section | What's in it |
| --- | --- |
| **Tours, dates & prices** | Names, summaries, dates, prices, board, airports, base, group size, walking, deposit, "What's included", day-by-day itinerary and photos, overview-map area and places. **New tours** can be created here and appear on the site, in the departures table and in the footer without any code change |
| **Testimonials** | Add, edit, delete, reorder, tag by tour or as military |
| **Photo galleries** | Photos, captions, order, which appear on the Gallery page |
| **Reading lists** | Books and authors |
| **Stand maps** | Stand positions and draft/confirmed status |
| **Pages** | Home, Tours and dates, Military studies, Tracing a relative, Testimonials, Gallery, Reading list, Contact, About, FAQs and "Page not found": every heading, paragraph, button label, photo and search-engine description. Featured testimonials are chosen from a list by name |
| **Site settings → Contact details** | Email, phone numbers, address, Facebook, tagline, main menu, footer text, company details |
| **Site settings → Wording** | Text used across many pages: tour-page labels and key facts, the departures table, map labels, enquiry-form labels and messages, and screen-reader labels |

Some text contains words in curly brackets, such as `Read all {count} testimonials` or `{days} days`. The site fills these in automatically, and each field's hint lists the ones available.

What still needs a developer:

- the design and layout (colours, fonts, page structure, which sections a page has);
- the map credit line, which OpenStreetMap's licence requires;
- the 3D stand map for a new area, which needs map tiles and terrain cut for that area (see NOTES.md);
- the enquiry forms' structure (adding or removing a field; the labels are editable);
- form handling, sign-in and hosting.

## Going live

1. **Sign-in.** Deploy Sveltia's OAuth helper ([sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)) as a Cloudflare Worker. Register a GitHub OAuth app whose callback points at the Worker, then set `base_url` in `public/admin/config.yml`. Frank then needs a GitHub account with write access to this repo. Give him a fine-grained, single-repo collaborator role.
2. **Rebuild on commit.** Enable the Komodo stack webhook, and add it as a GitHub webhook on push to `main`. Each save then triggers rebuild and redeploy, typically within a couple of minutes.
3. **Protect `/admin/`.** Put a Cloudflare Access policy for Frank and yourself in front of it, and add branch protection on `main` against force-pushes. nginx already sends `/admin/` with its own CSP and `noindex`.
4. **Check the editor's CSP** in the browser console once deployed. The `/admin/` policy in `deploy/nginx.conf` allows the GitHub API and `*.workers.dev`. Tighten it to your Worker's exact host.

## How it fits together

- `public/admin/index.html` loads `sveltia-cms.js`. This file is copied from `node_modules/@sveltia/cms` at build, so nothing loads from a CDN.
- `public/admin/config.yml` defines the forms: collections, fields, labels, hints and the GitHub backend.
- `src/content/<collection>/*.json` holds the content. The keys are kept in the same order as the form, so saves produce small diffs.
- `src/content.config.ts` holds the build-time rules (zod schemas). It also tolerates empty optional fields, whether the CMS saves them as `''`, `null` or leaves them out.
- `src/lib/content.ts` reads the collections and gives pages the shapes they expect. It also formats date ranges ("12–15 March 2027") and drops departures whose end date has passed.
- `public/img/library/` is the photo library and the CMS media folder. `scripts/optimise-uploads.mjs` makes the 640, 1280 and 2000px WebP versions at build time (about 45 seconds from cold, cached after that) into `public/img/u/`, which is git-ignored.
- `tools/cms-e2e.mjs` is a headless end-to-end test. It loads the editor, edits a tour, adds a testimonial and saves.
