# Wedding invitation site Ubaid & Sofia: Implementation Plan

**Spec:** docs/specs/2026-09-21-wedding-invitation-design.md
**Goal:** Ship a mobile-only Svelte 5 invitation with animation for Ngunduh Mantu 7 to 8 October 2026, backed by Hono, Neon and Drizzle on one Cloudflare Worker, with a single-admin-password screen for RSVP and guest book, deployed from GitHub.
**Architecture:** A single Cloudflare Worker runs a Hono app that serves /api routes and the built Svelte 5 SPA through an assets binding. Data lives in Neon, accessed with Drizzle and the neon serverless driver. The invitation is a portrait phone column, centred on desktop, with all editable content in one config file.

## Global constraints
- Build with Node 22 (observed v22.22.2), npm 12.
- Mobile-only layout, portrait card, centred when the viewport is wider than the card.
- One Cloudflare Worker. Static files and /api share one worker. No Pages.
- Hono for the server, Svelte 5 + Vite for the SPA, NeonDB + Drizzle ORM for data.
- No Better Auth. Admin auth is a single ADMIN_PASSWORD secret set with wrangler secret put. Never commit the value.
- jig tokens drive all UI colours and spacing. Run jig init before any component work.
- Animation uses CSS, small custom JS, dotLottie for the envelope intro, and PNG sprite sheets via CSS steps for character motion. No GSAP, no Framer Motion.
- Event is Ngunduh Mantu, 7 to 8 October 2026 from 09.00, main day 8 October. Venue Balai Desa Kalurahan Giripurwo, maps URL https://maps.app.goo.gl/SZFx3jEad7dZwmvi8.
- Music is a YouTube embed of https://www.youtube.com/watch?v=1892ujwIooo inside an iframe.
- Gallery and photos use Pexels placeholders. Sprites come from free sources or CSS shapes. WhatsApp share uses a dummy number.
- The letters INFJ appear nowhere in the copy.

## Environment facts
- Observed on this machine: Node v22.22.2, npm 12.0.2, git 2.53.0.windows.2, Windows, repo already has git main branch with the spec committed.
- The user will supply the Neon connection string (DATABASE_URL) and the admin password value. Both go into api/.dev.vars locally and into wrangler secrets at deploy time. The user creates the GitHub repository in Task 10 and follows the printed steps.

### Task 1: Scaffold the two-package repo → verify: both builds exit 0

**Files:**
- Create: `web/` (Vite Svelte scaffold)
- Create: `api/` (Hono Cloudflare worker scaffold)
- Create: `README.md`

- [x] Step 1: Scaffold the SPA with `npm create vite@latest web -- --template svelte`. Answer the interactive prompts if they appear (project name web, Svelte, TypeScript).
- [x] Step 2: Scaffold the worker with `npm create hono@latest api -- --template cloudflare-workers`. Answer prompts: no install yet if offered, name api.
- [x] Step 3: Remove demo code that does not belong to a wedding page: strip `web/src` demo component content down to a minimal App.svelte shell.
- [x] Step 4: Install dependencies in both packages: `npm install` in `web/`, then `npm install` in `api/`.
- [x] Step 5: Run `npm run build` in `web/`, then `npm run build` in `api/`.
- [x] Step 6: Write a README describing the monorepo layout and the two package scripts.
- [x] Step 7: Commit with message `feat: scaffold svelte and hono packages`.

### Task 2: Drizzle schema for Neon → verify: `drizzle-kit generate` exits 0 and a migration SQL file exists

**Files:**
- Create: `api/drizzle.config.ts`
- Create: `api/src/schema.ts`
- Create: `api/src/db.ts`
- Create: `api/.dev.vars` (gitignored)

- [x] Step 1: Add dependencies in `api/`: `npm i drizzle-orm @neondatabase/serverless`, then `npm i -D drizzle-kit @types/node`.
- [x] Step 2: Write `api/src/schema.ts` with two tables using neon serverless paginated config: `guests` (id uuid/text, name text, attendance text check in yes no maybe, guests integer, phone text nullable, created_at text default now ISO) and `messages` (id, name, message, hearts integer default 0, created_at).
- [x] Step 3: Write `api/src/db.ts` exporting a NeonPoolDatabase created from `env.DATABASE_URL` with the neon-http driver and the schema.
- [x] Step 4: Write `api/drizzle.config.ts` pointing dialect postgresql, schema ./src/schema.ts, out ./drizzle, and reading the connection string from the DATABASE_URL environment variable.
- [x] Step 5: Ask the user for the Neon connection string, then write it into `api/.dev.vars` as `DATABASE_URL=...` and add `api/.dev.vars` to `.gitignore`.
- [x] Step 6: Run `npx drizzle-kit generate` from `api/`.
- [x] Step 7: Run `npx drizzle-kit push` from `api/` to create tables in Neon.
- [x] Step 8: Commit with message `feat: drizzle schema for guests and messages`.

### Task 3: Hono API core with tests → verify: vitest exits 0 and `wrangler dev` answers /api routes

**Files:**
- Create: `api/src/index.ts`
- Create: `api/src/middleware.ts` (rate limiter and body helpers)
- Create: `api/src/routes/rsvp.ts`
- Create: `api/src/routes/messages.ts`
- Create: `api/src/lib/validate.ts`
- Create: `api/src/index.test.ts`
- Modify: `api/wrangler.toml` (add a fallback so missing routes serve the SPA later)

- [x] Step 1: Add `vitest` as a dev dependency in `api/`.
- [x] Step 2: Write `api/src/lib/validate.ts` with pure functions validating rsvp input (name present and at most 120 chars, attendance in yes no maybe, guests between 1 and 5, phone optional and at most 20 chars) and message input (name present and at most 60 chars, message present and at most 500 chars).
- [x] Step 3: Write `api/src/routes/rsvp.ts` with a POST insertion into `guests`.
- [x] Step 4: Write `api/src/routes/messages.ts` with a GET that returns public messages newest first and a POST that inserts one.
- [x] Step 5: Write `api/src/middleware.ts` with an in-memory rate limiter keyed by client IP allowing up to 30 requests per minute per route and a JSON body parser that rejects malformed JSON with HTTP 400.
- [x] Step 6: Write `api/src/index.ts` mounting the Hono app: a health check, the two route modules, and a CORS header for the local Vite dev origin.
- [x] Step 7: Write `api/src/index.test.ts` covering validation accepts and rejects, rate limiter blocking the 31st request in a minute, and a malformed body returning HTTP 400.
- [x] Step 8: Run `npm test` in `api/`.
- [x] Step 9: Run `npm run dev` in `api/` and confirm a request to `/api/health` returns HTTP 200.
- [x] Step 10: Commit with message `feat: hono api for rsvp and messages`.

### Task 4: Jig token layer → verify: jig.config.json exists and `npx jig-ui check` passes

**Files:**
- Create: `jig.config.json`
- Create: tokens source consumed by the SPA
- Create: `DESIGN.md`

- [x] Step 1: Run `npx jig-ui@latest init --yes` from the repo root. It derives brand values from the existing tokens or uses the theme from the spec: jade and cream with gold accents. If the command asks questions, answer jade, cream, gold.
- [x] Step 2: Confirm a `jig.config.json` file exists at the repo root and a tokens file is generated.
- [x] Step 3: Run `npx jig-ui check` and correct any mechanical findings it reports.
- [x] Step 4: Write `DESIGN.md` at the repo root recording the brand palette, type scale, spacing and component rules derived from the tokens, so later sessions inherit them.
- [x] Step 5: Commit with message `chore: initialize jig design tokens`.

### Task 5: SPA shell, content config, cover intro and hero → verify: built SPA serves and shows the cover

**Files:**
- Create: `web/src/lib/content.ts`
- Create: `web/src/lib/sections.svelte`
- Create: `web/src/App.svelte`
- Modify: `web/package.json`

- [x] Step 1: Write `web/src/lib/content.ts` with a content object: couple names Ubaid and Sofia, event name Ngunduh Mantu, date range 7 to 8 October 2026, main day 8 October 09.00, venue name Balai Desa Kalurahan Giripurwo, maps URL, music YouTube URL, WhatsApp share number, and placeholder arrays for gallery, bios, story timeline and closing text.
- [x] Step 2: Add `dotlottie` web component support via `npm install @dotlottie/wc`. Plan named a wrong package: real one is `@lottiefiles/dotlottie-wc` (0.9.28), installed.
- [x] Step 3: Write `web/src/App.svelte` as the phone column with a full-screen cover overlay that shows an animated envelope (a dotLottie LottieFiles asset or a CSS smoke-and-wax-seal if no free asset fits) and a tap to open action. Used a CSS envelope with gold wax seal (no free asset URL verifiable offline; CSS is deterministic and brand-coloured).
- [x] Step 4: Write the hero section under the cover: event name, bride and groom names, date line and a scroll hint.
- [x] Step 5: Add a countdown that targets the main day 8 October 2026 09:00 in the Asia/Jakarta timezone.
- [x] Step 6: Make the App run `npm run build` cleanly in `web/` and serve the static output with `npx wrangler dev` pointing at the assets to confirm the cover renders.
- [x] Step 7: Commit with message `feat: invitation shell, cover intro and hero`.

### Task 6: Invitation sections with placeholder content → verify: all section headings present in the rendered page

**Files:**
- Create: `web/src/lib/SectionCouple.svelte`
- Create: `web/src/lib/SectionStory.svelte`
- Create: `web/src/lib/SectionSchedule.svelte`
- Create: `web/src/lib/SectionGallery.svelte`
- Create: `web/src/lib/SectionClosing.svelte`
- Create: `web/src/lib/mock.ts`

- [x] Step 1: Write `web/src/lib/mock.ts` with the placeholder arrays from content.ts: two Pexels gallery images, a bio line for each couple, three story moments and a closing text. Write the copy by hand in a warm reflective tone. Do not use the word INFJ. Merged into `web/src/lib/content.ts` already written in Task 5 (hand-written copy, no INFJ).
- [x] Step 2: Build `SectionCouple.svelte` with the bios and photos.
- [x] Step 3: Build `SectionStory.svelte` with the timeline from mock data.
- [x] Step 4: Build `SectionSchedule.svelte` with the two days, the venue and a maps link using the maps URL.
- [x] Step 5: Build `SectionGallery.svelte` with the Pexels images in a simple grid and a lightbox on tap.
- [x] Step 6: Build `SectionClosing.svelte` with the closing text, a thank-you note and the guest names.
- [x] Step 7: Mount the sections in App.svelte, add a music toggle button that embeds the YouTube iframe lazily on first tap, and a fixed WhatsApp share button using the dummy number.
- [x] Step 8: Run `npm run build` in `web/` and serve the output to confirm every heading renders.
- [x] Step 9: Commit with message `feat: invitation sections with placeholder content`.

### Task 7: RSVP and guest book forms wired to the API → verify: submitting the guest book shows the posted message in the local list

**Files:**
- Create: `web/src/lib/SectionRsvp.svelte`
- Create: `web/src/lib/SectionMessages.svelte`
- Create: `web/src/lib/api.ts`

- [x] Step 1: Write `web/src/lib/api.ts` with fetch wrappers for POST /api/rsvp, GET /api/messages and POST /api/messages, pointing at the dev worker origin during local dev.
- [x] Step 2: Build `SectionRsvp.svelte` with a form for name, attendance radio yes no maybe, guest count, optional phone. Submit posts to /api/rsvp and show a success state on HTTP 2xx and an error state otherwise.
- [x] Step 3: Build `SectionMessages.svelte` that fetches messages on mount, lists them newest first, has a small form to post one, and re-fetches after posting.
- [x] Step 4: Run the worker with `npm run dev` in `api/` and the SPA with `npm run dev` in `web/`. Post a guest book message from the page and confirm it appears immediately in the list.
- [x] Step 5: Commit with message `feat: rsvp and guest book wired to api`.

### Task 8: Animation polish → verify: the sprite animation plays on the live page

**Files:**
- Create: `web/src/assets/` sprite sheet and lottie files
- Create: `web/src/lib/sprites.css`
- Modify: `web/src/App.svelte`

- [x] Step 1: Add a scroll-reveal helper: an IntersectionObserver that toggles a class when sections enter the viewport for fade and slide effects.
- [x] Step 2: Find or create a free sprite sheet for one illustrated element, for example a bird or falling petals, sized as a horizontal strip of frames.
- [x] Step 3: Write `web/src/lib/sprites.css` using CSS `steps()` on `background-position` to run the sprite sheet, with reduced-motion support via prefers-reduced-motion hiding the animation.
- [x] Step 4: Mount the animated sprite in the hero and one decorative element mid-page, both using only the sprite sheet.
- [x] Step 5: Add a very light particle field of petals or confetti behind the hero using CSS only, disabled for reduced motion.
- [x] Step 6: Run `npm run build` in `web/`, serve it, and confirm on a phone-sized viewport that the sprite and particles move.
- [x] Step 7: Commit with message `feat: sprite and particle animation`.

### Task 9: Admin screen and session login → verify: the wrong password returns 401 and the right one reaches the admin list

**Files:**
- Create: `api/src/admin.ts`
- Create: `api/src/routes/admin.ts`
- Create: `web/src/routes/admin.svelte`
- Create: `web/src/lib/api.ts` (admin additions)
- Modify: `api/wrangler.toml`

- [x] Step 1: Write `api/src/admin.ts` with a login handler: reads ADMIN_PASSWORD from env, compares with a timing-safe comparison, derives an HMAC key from the shared secret with SHA-256 via WebCrypto, signs a token shaped as base64url(payload).expiry.signature, sets an httpOnly Secure SameSite cookie, and enforces the rate limit of 5 attempts per IP per 15 minutes.
- [x] Step 2: Add `api/src/routes/admin.ts` with GET /api/admin/messages (public messages plus an admin flag false), DELETE /api/admin/messages/:id (requires the admin cookie, returns 401 without it), and POST /api/admin/logout clearing the cookie.
- [x] Step 3: Mount the admin routes in `api/src/index.ts` and expose the login endpoint under /api/admin/login.
- [x] Step 4: Write a vitest test in `api/` for login with a wrong password returning 401, the right password returning 2xx and setting a cookie, and 5 failed attempts within 15 minutes blocking the next attempt with 429.
- [x] Step 5: Run `npm test` in `api/`.
- [x] Step 6: Build `web/src/routes/admin.svelte`: a login form that posts to /api/admin/login, and after success shows the guest book with a delete button per message and the RSVP list.
- [x] Step 7: Run `npm run dev` in `web/`, try the flow with a wrong and right password, confirm the wrong one gets an error and the right one shows the list.
- [x] Step 8: Commit with message `feat: admin login and message moderation`.

### Task 10: Deploy to Cloudflare Workers with GitHub → verify: `wrangler deploy` reports success and the secrets are set

**Files:**
- Modify: `api/wrangler.toml` (assets binding to `../web/dist`, production env vars are not secrets in the file)
- Create: `.github/workflows/deploy.yml`
- Create: deploy notes in README

- [x] Step 1: Update `api/wrangler.toml` to serve the static output from `web/dist` as the assets binding and add a fallback to the SPA entry for unmatched routes.
- [x] Step 2: Build the SPA with `npm run build` in `web/`.
- [x] Step 3: Ask the user for the Cloudflare account: run `npx wrangler whoami` and confirm the right account is selected.
- [x] Step 4: Deploy with `npx wrangler deploy` from `api/`.
- [x] Step 5: Set secrets with `npx wrangler secret put DATABASE_URL` and `npx wrangler secret put ADMIN_PASSWORD`, pasting the values the user supplies.
- [x] Step 6: Verify the deployment: open the worker URL, confirm the cover renders and a guest book post persists across reload.
- [x] Step 7: Write `.github/workflows/deploy.yml` that on push to main runs `npm ci` and `npm run build` in both packages and `npx wrangler deploy` from `api/`, using secrets CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.
- [x] Step 8: Commit with message `feat: deploy workflow`.
- [ ] Step 9: Hand the user the GitHub setup steps in README: create an empty public repo on github.com, add the remote, push, then add the API token as a GitHub Actions secret. The user reports back when the workflow has run once.

### Task 11: Final verification pass → verify: a fresh `git clone` can run both builds to completion

**Files:**
- Create: `docs/checklist.md`

- [x] Step 1: Write `docs/checklist.md` with the manual device checklist from the spec: cover opens, music toggles, RSVP submits, guest book submits and persists, admin login with wrong and right password, message delete works.
- [x] Step 2: From a clean clone of the repo, run `npm install` and `npm run build` in both packages and confirm exit 0.
- [ ] Step 3: Confirm the deployed URL passes each checklist item on a real phone, or record which items failed.
- [x] Step 4: Commit `docs/checklist.md` with message `docs: device checklist`.

## Notes for the executing agent

- Better Auth is not part of this plan. The login uses a single password and an HMAC cookie.
- Any step that needs a value from the user (DATABASE_URL in Task 2, ADMIN_PASSWORD and Cloudflare account in Task 10, GitHub repo in Task 10 step 9) must stop and ask. Do not invent a connection string or a password.
- The word INFJ must not appear in copy anywhere.
- Reduced motion must hide sprite and particle animation for prefers-reduced-motion users.