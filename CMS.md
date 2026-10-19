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
- **Safety net:** in the raw file, set a price to some text, or an end date before the start date, then run `npm run build`. It fails with a message naming the field.

Run `git restore src/content public/img/library && git clean -fd public/img/library` to throw away test edits.

## What can and can't be edited

| Editable in the CMS | Still needs a developer |
| --- | --- |
| Tour names, summaries, dates, prices, board, airports, base | Adding a brand-new tour (needs an overview-map entry in `src/lib/places.ts`) |
| Day-by-day itineraries and the photos within them | Page layouts, and the Home, Military and Tracing-a-relative page text |
| Testimonials (add, edit, delete, reorder, tag by tour) | Navigation menu |
| Galleries (photos, captions, order, which appear on the Gallery page) | Map tiles for a new area (see NOTES.md) |
| Reading lists | |
| Stand positions and draft/confirmed status | |
| **About** page: heading, photo, text, research projects by year, gallery | |
| **FAQs**: questions and answers (with links, lists and tables), photo | |
| **Site settings**: email, phone numbers, address, Facebook, tagline, footer text, company details. These feed the header, footer, contact page and enquiry form | |


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
