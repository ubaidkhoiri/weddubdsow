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

- `npm run dev` — run the worker locally with Wrangler, serving `web/dist` as static assets (`http://localhost:8787`)
- `npm run build` — dry-run bundle of the worker to `dist/`
- `npm run deploy` — deploy to Cloudflare Workers
- `npm run cf-typegen` — regenerate `CloudflareBindings` types from Wrangler config

## Deploy

1. Set the secrets on the worker: `npx wrangler secret put DATABASE_URL` and `npx wrangler secret put ADMIN_PASSWORD`.
2. `npm run deploy` in `api/` after building `web/`, or let the GitHub Action do it.

### Continuous deployment

`.github/workflows/deploy.yml` deploys on every push to `main`. For it to work:

1. Push this repo to GitHub.
2. Create a Cloudflare API token with Workers permissions (edit templates: "Edit Cloudflare Workers").
3. In GitHub repo Settings → Secrets and variables → Actions, add:
   - `CLOUDFLARE_API_TOKEN` — the API token
   - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID