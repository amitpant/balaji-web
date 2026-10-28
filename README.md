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

Vercel or Netlify. Set the build command to `npm run build`, output to `dist/`, and add a rewrite of all routes to `/index.html` for client-side routing.
