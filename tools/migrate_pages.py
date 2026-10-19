# One-off: move every remaining hard-coded string into editable content files.
import json, glob
def w(p, o): open(p, 'w').write(json.dumps(o, indent=2, ensure_ascii=False) + '\n')
def r(p): return json.load(open(p))
L = lambda name: f'/img/library/{name}.webp'
lib = {f.split('/')[-1][:-5] for f in glob.glob('public/img/library/*.webp')}
def find(prefix): return L(next(n for n in sorted(lib) if n.startswith(prefix)))

# ---- Home gallery: book covers and the society logo now live elsewhere
g = r('src/content/galleries/home.json')
g['photos'] = [p for p in g['photos'] if 'book-' not in p['image'] and 'mcs-logo' not in p['image']]
w('src/content/galleries/home.json', g)

w('src/content/pages/home.json', {
  "seo_description": "Small-group battlefield studies of the Italian Campaign 1943–45 at Cassino, Anzio, Salerno, the Sangro and the Gothic Line, led by former infantry officer and author Frank de Planta.",
  "hero_image": find('the-abbey-of-monte-cassino-and-the-battlefields'),
  "hero_alt": "The Abbey of Monte Cassino above the Liri valley",
  "hero_place": "Monte Cassino", "hero_coords": "41°29′N 13°48′E",
  "hero_heading": "Stand on the ground and understand the battle.",
  "hero_text": "Battlefield studies of the Italian Campaign at Cassino, Anzio, Salerno, the Sangro and the Gothic Line. Led in person by Frank de Planta, former Royal Anglian officer and author of *A Walking Tour of Italy’s WWII Battlefields*.",
  "hero_primary_label": "See 2027 dates", "hero_secondary_label": "Ask Frank a question",
  "departures_heading": "Next departures", "departures_link_label": "All tours and itineraries",
  "departures_note": "Prices exclude flights. Single rooms are available on every tour. A £80 deposit holds your place.",
  "approach_heading": "Studied the way soldiers study a battle",
  "approach_lede": "Each day is built around a series of stands: places with a clear view of the ground where Frank explains what each side planned, what happened, and why.",
  "approach_body": "The detail goes down to battalion, brigade, division and corps level, so you see how a decision at corps headquarters played out for the men on Snakeshead Ridge or in the Anzio wadis. Groups are kept small, the pace is unhurried, and the minibus stays with you all day.\n\nMany guests come because a father or grandfather served in Italy. Tell Frank the unit and he will build the relevant actions, cemeteries and memorials into your tour. [Tracing a relative](/tracing-a-relative/)",
  "campaigns_heading": "The campaigns",
  "quotes_heading": "What guests say", "quotes_link_label": "Read all {count} testimonials",
  "featured_quotes": ["001-bill-vodra", "002-lt-col-guy-stone-wg", "128-steve-deput"],
  "military_heading": "For units and military groups",
  "military_text": "Frank has led battlefield studies for Army Headquarters, NATO’s Joint Force Command Naples, the Royal Gurkha Rifles, the Royal Artillery and many more. Each is built around the training objectives you set.",
  "military_button": "Military battlefield studies",
  "military_quote": "008-maj-fletch-fletcher",
  "books_heading": "The guidebooks",
  "books_intro": "Frank’s three-volume *A Walking Tour of Italy’s WWII Battlefields* (Nova Science Publishers) takes you from the Salerno landings to the fall of Rome, stand by stand.",
  "books": [
    {"image": find('book-salerno'), "title": "From the Salerno Landings to San Pietro Infine", "isbn": "978-1-53618-572-0"},
    {"image": find('book-cassino'), "title": "Breaking the Gustav and Hitler Lines", "isbn": "978-1-53619-076-2"},
    {"image": find('book-anzio'), "title": "From the Anzio Landings to Rome", "isbn": "978-1-53619-077-9"}],
  "archive_heading": "From the archive and the field", "archive_link_label": "Full gallery", "archive_gallery": "home"
})
w('src/content/pages/tours.json', {
  "title": "Tours and dates",
  "seo_description": "Battlefield studies of the Italian Campaign: Cassino, Anzio and the Garigliano, Salerno, the Sangro, the Gothic Line and Rome to Bologna. 2027 dates and prices.",
  "heading": "Tours and dates",
  "lede": "Four- and five-day studies of single campaigns, and a nine-day tour following the Allied armies from Rome to Bologna. Prices are per person and exclude flights, so you can arrive early or stay on in Rome.",
  "itineraries_heading": "Itineraries",
  "private_heading": "Your own dates",
  "private_text": "Private groups, regimental associations and families can book any study on dates that suit them, or combine several campaigns into one longer tour.",
  "private_button": "Plan a private tour"
})
w('src/content/pages/military.json', {
  "title": "Military battlefield studies",
  "seo_description": "Battlefield studies and staff rides in Italy for military units, led by former infantry officer Frank de Planta and tailored to your training objectives.",
  "heading": "Military battlefield studies",
  "lede": "Studies at Cassino, Anzio, Salerno and the Gothic Line, built around your training objectives and pitched to every rank in the group.",
  "body": "Frank is a former Royal Anglian Regiment officer. He reads the ground as an infantryman and links the tactical action back to the operational and strategic picture. Where it helps, he draws out parallels with contemporary doctrine.\n\nHe has run single-day and multi-day studies for all-rank audiences and for multinational senior staff, at OR-4 to OF-8.",
  "image": find('photo-16-06-2023'), "image_caption": next(p['caption'] for p in r('src/content/galleries/about.json')['photos'] if 'photo-16-06-2023' in p['image']),
  "steps_heading": "How a unit study works",
  "steps": [
    {"title": "Objectives first.", "text": "Tell Frank what the study is for, such as combined arms, river crossings, command at brigade level, or regimental heritage. He will propose the campaign and stands that fit best."},
    {"title": "Your dates and length.", "text": "One day to a full week, for small command teams or for groups of up to 50."},
    {"title": "Preparation.", "text": "Briefing packs for the group, with a reading list for those who want to go further. Syndicate tasks can be set on request."},
    {"title": "On the ground.", "text": "Frank leads every stand himself, and transport stays with the group throughout."}],
  "quotes_heading": "From the units", "quotes_link_label": "All {count} unit testimonials",
  "featured_quotes": ["004-lt-cmdr-matt-feeney-rn", "006-maj-andy-bishop", "003-maj-chin-thapa-mvo-rgr"],
  "units_heading": "Units Frank has guided", "units_count": 18,
  "form_heading": "Plan a study"
})
w('src/content/pages/tracing.json', {
  "title": "Tracing a relative",
  "seo_description": "Follow the footsteps of a father, grandfather or uncle who fought in Italy. Frank de Planta builds their unit’s actions, cemeteries and memorials into your tour.",
  "heading": "Following a relative’s war",
  "image": find('lt-gh-wright'), "image_caption": next(p['caption'] for p in g['photos'] if 'lt-gh-wright' in p['image']),
  "lede": "Many people come on a tour because someone in their family served in Italy. With a name and a unit, Frank can usually place them on the battlefield.",
  "body": "He works through the war diaries and regimental histories, then builds the right actions into your tour, along with the cemetery or memorial where your relative is remembered. On a scheduled tour this happens alongside the main study. On a private tour, it can be the whole point.",
  "quote": "007-sally-low",
  "helps_heading": "What helps Frank most",
  "helps": "- Full name, rank and service number\n- Regiment and battalion, or the corps and unit\n- Dates and places mentioned in letters, photographs or medal records\n- For those who died, the cemetery or memorial (the [CWGC database](https://www.cwgc.org/find-records/find-war-dead/) will show this)\n\nDon’t worry if you only have some of this. Send what you know.",
  "form_heading": "Tell Frank about them",
  "families_heading": "Families who have made the journey",
  "family_quotes": ["013-veronica-lisle", "017-janet-sargeant-sue-shingler", "034-don-murray"]
})
w('src/content/pages/testimonials.json', {
  "title": "Testimonials",
  "seo_description": "{count} testimonials from serving soldiers, veterans, families and historians who have toured the Italian battlefields with Frank de Planta.",
  "heading": "What guests say",
  "lede": "{count} accounts from people who have walked the ground with Frank: {military} from serving units, the rest from families, veterans and enthusiasts.",
  "gallery": "testimonials",
  "filter_all": "All", "filter_military": "Military units", "filter_private": "Private guests"
})
w('src/content/pages/gallery.json', {
  "title": "Gallery",
  "seo_description": "Wartime photographs, maps and present-day views of the battlefields at Cassino, Anzio, Salerno and the Gothic Line.",
  "heading": "Gallery",
  "lede": "Wartime photographs and maps alongside the same ground today, many of them contributed by people who have toured with Frank.",
  "count_label": "{count} photographs", "show_all_label": "Show all {count} photographs", "initial_count": 24
})
w('src/content/pages/reading.json', {
  "title": "Reading list",
  "seo_description": "Frank de Planta’s reading lists for the Italian Campaign: general histories and memoirs, and regimental and corps histories.",
  "heading": "Reading list",
  "lede": "The books Frank recommends before you travel: {general} general histories and memoirs, and {regiments} regimental and corps histories for anyone following a particular unit.",
  "search_label": "Search by title, author or regiment", "search_placeholder": "e.g. Gurkha, Majdalany, Anzio",
  "galleries": ["general-reading-list", "regiment-core"]
})
s = r('src/content/settings/site.json')
w('src/content/pages/contact.json', {
  "title": "Contact and booking",
  "seo_description": "Book a place or ask Frank de Planta a question about Cassino Battlefields tours. Phone, email and post details.",
  "heading": "Book or ask a question",
  "intro": s.pop('contact_intro', ''),
  "email_label": "Email", "phone_label": "Telephone", "post_label": "Post", "facebook_heading": "Facebook",
  "form_heading": "Send an enquiry"
})
w('src/content/pages/not-found.json', {
  "title": "Page not found", "seo_description": "This page has moved or no longer exists.",
  "heading": "This page has moved",
  "text": "The site has been rebuilt and some addresses have changed. Try the tours and dates, or get in touch.",
  "primary_label": "Tours and dates", "primary_link": "/tours/", "secondary_label": "Contact", "secondary_link": "/contact/"
})
s['navigation'] = [{"label": l, "link": u} for u, l in [('/tours/', 'Tours'), ('/about/', 'About Frank'), ('/testimonials/', 'Testimonials'), ('/gallery/', 'Gallery'), ('/reading-list/', 'Reading'), ('/faqs/', 'FAQs')]]
s['enquire_label'] = 'Enquire'; s['enquire_link'] = '/contact/'
s['footer_contact_heading'] = 'Get in touch'; s['footer_tours_heading'] = 'Tours'
w('src/content/settings/site.json', s)

w('src/content/settings/wording.json', {
  "tour_page": {
    "title_suffix": "battlefield tour",
    "seo_template": "{tour}, {period}: a {days}-day battlefield study led by Frank de Planta. {short}.",
    "stand_map_heading": "The stands on the ground",
    "day_by_day_heading": "Day by day", "day_label": "Day",
    "no_itinerary_text": "Frank will send the full itinerary with your booking form.", "no_itinerary_link": "Ask for the itinerary",
    "included_heading": "What’s included", "not_included_heading": "Not included",
    "not_included_template": "{excludes}, and travel insurance (which you must have to travel).",
    "facts_label_dates": "Next dates", "facts_label_duration": "Duration", "facts_days": "{days} days",
    "facts_label_arrive": "Fly into", "facts_label_depart": "Fly home from", "facts_label_base": "Based in",
    "facts_label_group": "Group size", "facts_label_walking": "Walking", "facts_label_deposit": "Deposit",
    "price_twin_label": "per person sharing a twin or double, {basis}", "price_single_label": "{price} in a single room",
    "no_price_text": "Dates and prices on request",
    "book_label": "Book a place", "register_label": "Register interest",
    "reduced_price_note": "Already in Italy, or travelling with your own transport? Ask about the reduced price.",
    "quotes_heading": "From past {tour} groups", "quotes_link_label": "All testimonials",
    "pictures_heading": "{tour} in pictures", "pictures_link_label": "Full {tour} gallery"
  },
  "departures": {"days": "{days} days", "price": "from {price}", "price_note": "per person, sharing, {basis}", "no_price": "Price on request"},
  "maps": {
    "overview_legend_airport": "Airport", "overview_legend_base": "Where you stay", "overview_legend_place": "Places studied",
    "draft_notice": "Draft: stand positions are approximate and awaiting Frank’s confirmation.",
    "view_3d": "3D terrain", "view_flat": "Flat map", "no_js": "The interactive map needs JavaScript. The stands are listed alongside."
  },
  "enquiry": {
    "name": "Your name", "email": "Email", "phone": "Phone (optional)", "tour": "Tour", "unit": "Unit",
    "people": "Number of people", "room": "Room", "room_options": ["Twin or double, sharing", "Single", "Not sure yet"],
    "extra_tour_options": ["Private group", "Not sure yet"],
    "group_size": "Approximate group size", "preferred_dates": "Preferred dates", "preferred_dates_placeholder": "e.g. May 2027",
    "relative_name": "Relative’s name and rank", "relative_unit": "Unit, if known", "relative_unit_placeholder": "e.g. 2nd Bn Royal Fusiliers",
    "relative_details": "Service number, dates or where buried, if known",
    "message_tour": "Anything else", "message_military": "Training objectives and anything else Frank should know", "message_relative": "What you know so far",
    "submit": "Send to Frank",
    "help": "This opens your email app with the details filled in, ready to send to {email}.",
    "error": "Add your name and a valid email address so Frank can reply.",
    "sent": "Your email app should now be open. If it isn’t, email {email} directly.",
    "subject_tour": "Tour enquiry: {tour}", "subject_military": "Military battlefield study enquiry", "subject_relative": "Tracing a relative"
  },
  "general": {"skip_link": "Skip to content", "menu_button": "Menu", "lightbox_close": "Close"}
})

# ---- per-tour facts, included list and overview-map places (were hard-coded)
places = {
  'cassino': ([11.75, 40.95, 14.35, 42.0], [('Rome airports', 41.80, 12.42, 'airport', 'left'), ('Cassino', 41.488, 13.831, 'base', 'right'), ('Hitler Line', 41.475, 13.69, 'place', 'below-left'), ('Velletri', 41.687, 12.777, 'place', 'right')]),
  'anzio-and-the-garigliano': ([11.75, 40.95, 14.2, 42.0], [('Rome airports', 41.80, 12.42, 'airport', 'left'), ('Cassino', 41.488, 13.831, 'base', 'right'), ('Anzio', 41.447, 12.627, 'place', 'left'), ('Campoleone', 41.648, 12.665, 'place', 'right'), ('Cisterna', 41.591, 12.828, 'place', 'right'), ('Minturno', 41.263, 13.746, 'place', 'left')]),
  'gothic-line': ([12.2, 43.5, 13.6, 44.2], [('Ancona airport', 43.616, 13.362, 'airport', 'left'), ('Montefabbri', 43.83, 12.73, 'base', 'right'), ('Rimini', 44.06, 12.568, 'place', 'right'), ('San Marino', 43.936, 12.447, 'place', 'left'), ('Gemmano', 43.905, 12.582, 'place', 'below-right'), ('Coriano', 43.968, 12.6, 'place', 'right')]),
  'sangro': ([13.6, 41.8, 14.9, 42.6], [('River Sangro', 42.235, 14.505, 'place', 'right')]),
  'salerno': ([14.1, 40.3, 15.3, 41.0], [('Naples airport', 40.886, 14.291, 'airport', 'left'), ('Salerno', 40.68, 14.768, 'base', 'right'), ('Battipaglia', 40.608, 14.98, 'place', 'right'), ('Altavilla', 40.534, 15.133, 'place', 'right'), ('Paestum', 40.422, 15.006, 'place', 'left')]),
  'rome-to-bologna': ([10.9, 41.6, 13.0, 44.9], [('Rome', 41.80, 12.42, 'airport', 'left'), ('Orvieto', 42.718, 12.111, 'place', 'left'), ('Arezzo', 43.463, 11.88, 'place', 'right'), ('Florence', 43.77, 11.255, 'place', 'left'), ('Futa Pass', 44.08, 11.28, 'place', 'left'), ('Rimini', 44.06, 12.568, 'place', 'right'), ('Argenta', 44.61, 11.84, 'place', 'right'), ('Bologna', 44.535, 11.29, 'airport', 'left')]),
}
for f in glob.glob('src/content/tours/*.json'):
    slug = f.split('/')[-1][:-5]; t = r(f)
    hb = t.get('price_basis') == 'half board'
    t['group_size'] = '8 to 50'
    t['walking'] = 'Light; the minibus is always close by'
    t['deposit'] = '£80 per person'
    t['included'] = ['Minibus or coach from the airport, staying with the group throughout',
                     'Hotel accommodation with breakfast and evening meal' if hb else 'En-suite hotel rooms with continental breakfast',
                     'A briefing pack for each room booked, covering the background to the battles',
                     'Frank de Planta as your guide on every day of the study']
    t['map_route'] = slug == 'rome-to-bologna'
    bbox, pl = places[slug]
    t['map_area'] = {'west': bbox[0], 'south': bbox[1], 'east': bbox[2], 'north': bbox[3]}
    t['map_places'] = [{'name': n, 'lat': la, 'lng': lo, 'kind': k, 'label': lab} for n, la, lo, k, lab in pl]
    t['seo_description'] = ''
    w(f, t)
print('done')
