# wedding-invitation

A wedding invitation site built as a two-package monorepo.

## Layout

- `web/` — the invitation SPA. Vite + Svelte 5, phone-width single page.
- `api/` — the backend worker. Hono on Cloudflare Workers (Wrangler).

Each package installs and runs on its own from its own directory.

## Scripts

`web/`:

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`

`api/`:

- `npm run dev` — run the worker locally with Wrangler
- `npm run build` — dry-run bundle of the worker to `dist/`
- `npm run deploy` — deploy to Cloudflare Workers
- `npm run cf-typegen` — regenerate `CloudflareBindings` types from Wrangler config