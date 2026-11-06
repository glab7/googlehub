# Orbita: business apps on one platform

A business-suite landing page in the style of Odoo, with its own original brand ("Orbita"),
a frosted-glass theme and heavy motion. It ships as:

| Part | Stack | Folder |
| --- | --- | --- |
| Website | Next.js 15 (static export), TypeScript, Tailwind CSS v4 | `web/` |
| Edge API | Cloudflare Pages Functions (TypeScript) | `functions/` |
| Self-hosted API + static server | Go 1.22, standard library only | `server/` |
| Mobile / desktop app | Flutter 3.27+ | `mobile/` |
| Lead storage | Firebase Firestore (`main-branch-8b78f`) | `firestore.rules` |

All three clients read one catalog file, `web/public/data/catalog.json`: the app list,
categories and pricing plans.

## Libraries used on the website

- **Skiper UI** (free components, installed with the shadcn CLI into `web/src/components/ui/skiper-ui/`):
  text-roll nav links (58), scroll letter reveal (31), GSAP pinned card stack (17),
  scroll-drawn line (19), count-up numbers (37), underline links (40), progressive blur (41),
  coverflow carousel (47), hover-expand panels (52), cursor glow (61), scroll progress dial (89).
  The free tier requires attribution, which is in the footer.
- **Animate UI** (`web/src/components/animate-ui/`): bubble aurora background, liquid buttons,
  theme toggler, animated tabs, sliding numbers, highlight / shimmering / gradient text,
  magnetic and tilt effects.
- **Motion** (Framer Motion): entrances, springs, scroll-linked transforms.
- **GSAP + ScrollTrigger**: the pinned stacked feature cards.
- **Anime.js v4**: the floating hero app tiles and the ripple when filtering the app grid.
- **Lenis**: smooth scrolling. **Swiper**: the testimonial coverflow. **NumberFlow**: animated digits.

## Run locally

```bash
npm install            # root tools (wrangler, typescript) + web/ dependencies
npm run build          # builds the site to web/out

# Option A: Go server (static site + API, leads kept in memory)
cd server && go run .                  # http://localhost:8080

# Option B: Cloudflare Pages locally (static site + edge API)
npm run dev                            # http://localhost:8788
```

To develop the UI with hot reload, run `npm run dev:web` (http://localhost:3000).
The contact form needs an API, so start the Go server too and run
`NEXT_PUBLIC_API_BASE=http://localhost:8080 npm run dev:web`.

To store Go-server leads in Firestore instead of memory:

```bash
FIREBASE_PROJECT_ID=main-branch-8b78f go run .
```

## API

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/apps?category=&q=` | Filter by category and/or search text |
| GET | `/api/plans` | Pricing plans |
| POST | `/api/contact` | `{name, email, company?, message?}`, saved to Firestore `leads` |

Validation limits are the same in Go, the Pages Function and `firestore.rules`.
Firestore rules allow clients only to **create** a valid lead. No client can read,
update or delete leads; view them in the Firebase console.

## Deploy

One-time Firebase setup (project `main-branch-8b78f`): enable Cloud Firestore and create the
`(default)` database in the console, then deploy the rules:

```bash
npm run deploy:rules
```

Cloudflare Pages (static site + `/api` functions):

```bash
npm run deploy         # builds web/out and runs `wrangler pages deploy`
```

## Flutter app

`mobile/` contains `lib/` and `pubspec.yaml`. Generate the platform folders once, then run:

```bash
cd mobile
flutter create . --project-name orbita --platforms=android,ios,web,macos
flutter pub get
flutter run --dart-define=API_BASE=https://orbita.pages.dev
```

Without a reachable API it falls back to the bundled `assets/catalog.json`
(a copy of `web/public/data/catalog.json`).

## Not included

There is no login or signup. Every "Contact us" / "Get started" button opens the
contact form.
