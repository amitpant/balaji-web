# balaji-web

React (Vite) app for the Balaji Construction public website and admin panel at `/admin`.
Specs: see the `balaji-docs` repo.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173, proxies /api to http://localhost:4000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the build locally |
| `npm run lint` | ESLint |

## Deploy

**Cloudflare (current):** connected to this repo; every push to `main` rebuilds and deploys.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

`wrangler.jsonc` holds the project name, the `dist/` folder, and single-page-app routing.

Vercel or Netlify also work: build `npm run build`, output `dist/` (`vercel.json` handles routing).
