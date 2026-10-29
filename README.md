# balaji-web

Website and admin panel for **Balaji Construction Private Limited**, in English and Hindi.
React (Vite) + Tailwind CSS, served by a Cloudflare Worker that also forwards `/api/*` to the
[`balaji-api`](https://github.com/amitpant/balaji-api) Worker. Specs live in `balaji-docs`.

Live: https://balaji-web.amitpant-05.workers.dev (Hindi: `/hi`, admin: `/admin`)

## What is where

| Path | Purpose |
| --- | --- |
| `worker.js` | Website Worker: forwards `/api/*` to balaji-api, serves `robots.txt` and `sitemap.xml`, injects per-page language, title, description, canonical, hreflang, Open Graph and JSON-LD into the HTML |
| `src/i18n/strings.js` | Every interface string in English and Hindi |
| `src/i18n/meta.js` | Page titles/descriptions (EN + HI), URL → page parsing; shared by the app and `worker.js` |
| `src/pages/` | Public pages: Home, Projects, Project detail, Services, About, Contact, Not found |
| `src/pages/admin/` | Admin panel (English, lazy-loaded): Projects, Enquiries, Reviews, Social media, Settings |
| `src/components/` | Layout (header, footer, language switch), sections (services, process, FAQ, testimonials, stats), UI |
| `src/styles/index.css` | Design tokens (palette below), self-hosted fonts |
| `tests/e2e/site.e2e.cjs` | Browser test suite (124 checks) |

## Languages

- English at `/…`, Hindi at `/hi/…` (e.g. `/hi/projects`). The **हिंदी / English** button keeps the current page.
- Interface text: `src/i18n/strings.js`. Page metadata: `src/i18n/meta.js`.
- Content typed in the admin panel (project names, descriptions) is shown as entered. The About text has separate English and Hindi fields.

## Content rules (no invented business details)

The site never shows placeholder or invented contact details, numbers, reviews or claims:

| Item | Source | When empty |
| --- | --- | --- |
| Projects, photos, videos, details | Admin → Projects | Empty-state message; empty fields hidden |
| Phone, WhatsApp, email, address, map | Admin → Settings / Social media | No call/WhatsApp buttons; the enquiry form is always available |
| Services | Admin → Settings → Services offered | Derived from the categories of published projects |
| Home page numbers | Admin → Settings | Section hidden |
| Reviews | Admin → Reviews | Section hidden |
| About text | Admin → Settings (EN + HI) | One neutral sentence |
| Social icons, Meta Pixel | Admin → Social media | Hidden / not loaded |

## Design

| Token | Value | Use |
| --- | --- | --- |
| Charcoal | `#202923` | Text, dark sections (with blueprint grid) |
| Construction orange | `#DF6A35` | Accents, large display text, on charcoal |
| Orange (text/buttons) | `#B4501F` | Buttons and small text on light backgrounds (5.1:1 contrast; `#DF6A35` is 3.4:1 and fails WCAG AA for small text) |
| Warm off-white | `#F7F5F0` | Page background |
| Muted sage | `#E8EDE5` | Alternate sections, image placeholders |

Fonts are self-hosted: Inter (Latin) and Noto Sans Devanagari (Hindi). Letter-spacing is disabled for Hindi because it breaks Devanagari shaping.

## Setup

```bash
git clone https://github.com/amitpant/balaji-web
git clone https://github.com/amitpant/balaji-api      # side by side
cd balaji-api && npm install && cp .dev.vars.example .dev.vars   # fill in values
cd ../balaji-web && npm install
```

## Run locally

Both Workers together, exactly as in production (local D1 database):

```bash
npm run dev:workers          # builds, then http://127.0.0.1:8790 (site + /api + /admin)
```

Front-end only, with hot reload (needs `npm run dev` running in balaji-api on port 8787):

```bash
npm run dev                  # http://localhost:5173, proxies /api to :8787
```

## Configuration

Website Worker (`wrangler.jsonc`): service binding `API` → `balaji-api`; every request runs `worker.js` first.
No secrets are needed in this repo. API secrets (`JWT_SECRET`, `CLOUDINARY_*`, `ADMIN_*`) live only in the
Cloudflare dashboard for **balaji-api** (type **Secret**) and in `balaji-api/.dev.vars` locally (git-ignored).

## Testing

```bash
npm run lint
npm run build
cd ../balaji-api && npm test         # 23 API tests against a local D1
```

Browser suite: both languages × mobile (375), tablet (820), desktop (1366); link crawl; sitemap and
server-side SEO; menu, language switch, FAQ and photo viewer by keyboard; enquiry validation and
submission in both languages; contact links with and without saved details; axe WCAG 2.1 AA; admin.

```bash
# balaji-api/.dev.vars must contain ADMIN_EMAIL=owner@example.com and ADMIN_PASSWORD=correct-horse
rm -rf /tmp/d1e2e
npx wrangler dev -c wrangler.jsonc -c ../balaji-api/wrangler.jsonc --port 8790 --persist-to /tmp/d1e2e &
BASE=http://127.0.0.1:8790 npm run test:e2e   # screenshots → tests/e2e/screenshots/
```

## Deploy

Cloudflare Workers Builds is connected to this repo: every push to `main` builds (`npm run build`)
and deploys (`npx wrangler deploy`). `balaji-api` deploys the same way from its own repo and must
exist before this Worker (service binding). After deploying, check:

- `/` and `/hi` load, language switch works, `/sitemap.xml` lists both languages
- `/api/health` returns `{"status":"ok"}`
- an enquiry from `/contact` appears in Admin → Enquiries
