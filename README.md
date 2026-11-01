# Voyaj — Travel & Tourism website + Admin (CMS · CRM)

A design-led travel agency website built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Motion** and **Lenis** smooth scrolling. It includes a full admin panel, so the whole site can be managed without touching code.

## Quick start

```bash
npm install
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin (default password `admin123`)
- Replay the intro animation: http://localhost:3000/?intro=1

Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD` and `ADMIN_SECRET` before deploying.

## Design presets (Admin → Settings → Theme)

Three complete design directions — each with its own type pairing, palette, shape language and homepage hero. Switch with one click; colours remain editable.

| Preset | Fonts | Palette | Hero |
| --- | --- | --- | --- |
| **Postcard** (default) | Bricolage Grotesque + Instrument Sans | sand · jade · peach | A shuffling, draggable stack of postcards with stamps and postmarks, plus an "address line" search |
| **Horizon** | Unbounded + Manrope | dark ocean · aqua glow | The destination name set huge, with the photo inside the letters; scroll to fly through the type |
| **Window Seat** | Archivo (width axis) | paper · Klein blue | An aircraft-window slideshow that opens to full screen on scroll, a split-flap board and a boarding-pass search |

**Hero layout** is chosen separately (Admin → Settings → Hero): **Cinematic** (default — full-bleed photos that change with a staggered "shutter" of vertical slices, a large letter-by-letter destination name, a destination list with progress bars, mouse parallax and a frosted-glass search bar), **Postcard stack**, **Text mask** or **Window seat**.

Text and button colours adjust automatically for dark or light backgrounds and accents.

## Website features

- **Design system**: a single variable sans-serif (Archivo, with a width axis) for both condensed headlines and expanded accent words; Klein-blue accent; grid lines and boarding-pass details. Includes **page transitions**.
- **Intro animation**: a counter, a framed destination slideshow and changing words, then the frame expands to full screen and lifts into the hero. You can set it all from the admin panel: on/off, play once per session, duration, words, images and tagline.
- **Navbar**: an editorial top bar that hides when you scroll down and comes back when you scroll up. The Menu button opens a full-screen accent-colour menu with a circular reveal; links stretch along the font width axis on hover, with image previews.
- **"Window seat" hero**: poster-style headline next to an aircraft-window slideshow, a split-flap "Now boarding" board, and a boarding-pass search. As you scroll, the window opens to full screen ("Now arriving").
- **Spotlight search** (⌘K), live clock and wishlist counter in the navbar.
- **Signature homepage sections**:
  - **Velocity marquee**: two rows of destination names (solid and outline) whose speed, direction and slant follow how fast you scroll.
  - **Manifesto**: text fills in word by word, with photos drifting past at different speeds.
  - **Destinations rail**: pinned and scrolls sideways, with the photos moving inside each card.
  - **Journey index**: an editorial list. The row under your cursor fills with the accent colour, and a photo of that journey follows the cursor.
  - **Ways to travel**: full-screen experience cards that stack on top of each other as you scroll.
  - **Globe**: a rotating, draggable dotted globe drawn on a canvas, with glowing flight routes from Mumbai to every destination, next to counting stats.
  - **How it works**: a flight path draws itself as you scroll, a plane flies along it, and each step's card appears as the plane reaches it.
  - **Review wall**: two rows of review cards moving in opposite directions, plus a rating summary.
  - **Journal**: a bento layout with one large story and smaller ones beside it.
  - **Closing call-to-action**: an image that grows as you scroll in.
- **Journeys**: filtering by category, length, departure month and price, plus search and sort.
- **Journey detail page**: photo gallery with a full-screen viewer, day-by-day itinerary, what's included and excluded, reviews, related journeys, and a **3-step booking widget** that creates bookings in the CRM.
- **Other pages**:
  - Destinations: grid with a region filter, plus a detail page for each destination.
  - Journal (blog): list and article pages.
  - About.
  - Contact: a 3-step trip enquiry form that creates leads in the CRM.
  - Wishlist: saved journeys, stored in the browser.
  - A custom 404 page.
- **Extras**: newsletter sign-up, floating WhatsApp button, custom cursor on desktop, scroll progress bar, announcement bar, SEO metadata. The design is mobile-first and respects the reduced-motion setting.

## Admin panel (`/admin`)

- **Dashboard**: revenue, bookings, open leads, conversion rate and subscribers; a 6-month revenue chart; the lead pipeline; recent activity; top journeys.
- **CRM**:
  - Leads: kanban board with drag-and-drop or a list view, notes, deal value, quick Email/Call/WhatsApp buttons, CSV export.
  - Bookings: status changes, filters, CSV export.
  - Customers: one view per person with lifetime value and tiers.
  - Subscribers.
- **CMS**: journeys (with itinerary, gallery and departure dates), destinations, journal posts, experiences, testimonials, FAQs.
- **Site settings**:
  - Brand and contact details.
  - Theme: accent, dark and paper colours, plus corner radius.
  - Intro animation and hero.
  - Announcement bar and navigation links.
  - Homepage section on/off switches.
  - Manifesto, stats and SEO.
  - Reset to demo data.

## Data

The data is stored in `lib/db.ts`, a small JSON-file database (`data/db.json`). It is created from the demo content in `lib/seed.ts` the first time the site runs.

On read-only or serverless hosts (for example Vercel), changes are kept in memory only and are lost when the server restarts. For production, replace `lib/db.ts` with Postgres, Supabase or MongoDB. The rest of the app only uses the functions exported from that file.

Images come from Unsplash. You can use any image URL in the admin panel.
