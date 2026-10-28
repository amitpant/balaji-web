# CLAUDE.md — balaji-web

React app for the Balaji Construction public website and admin panel (`/admin`).

## Read first

The specs live in the `balaji-docs` repo. Before any change, read:
- `02-features.md` for user stories and "done when"
- `04-api-contract.md` for the API this app calls
- `05-design-guide.md` for tokens and layout rules
- `tasks/backlog.md` for the task you are doing

## Stack

React + Vite, React Router, Tailwind CSS v4 (tokens in `src/styles/index.css`), TanStack Query for data, React Hook Form + Zod for forms.

## Layout

```
src/
  main.jsx, router.jsx
  config/site.js     # placeholder company details (replaced by /api/settings)
  components/        # shared UI
  pages/             # public pages
  pages/admin/       # admin screens, lazy-loaded
  api/               # fetch helpers per resource (add as needed)
  styles/index.css   # design tokens
```

## Design rules

- Minimal, fresh, clean. White space, real photos, one accent colour (`accent`).
- Use the tokens (`bg`, `bg-soft`, `ink`, `ink-soft`, `line`, `accent`); no new colours.
- Sentence-case headings. No emoji, no auto-playing carousels.
- Mobile-first. Check every change at 375px and 1280px wide.
- Show a project field only when it has a value.

## Rules

- `npm run lint && npm run build` must pass before a PR.
- Admin pages stay under `pages/admin/` and are lazy-loaded.
- One task per branch (`p4-2-projects-page`) and pull request; reference the task ID.
- UI changes: include phone and desktop screenshots in the PR.
