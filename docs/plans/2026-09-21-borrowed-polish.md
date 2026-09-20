# Borrowed polish: Implementation Plan

**Spec:** docs/specs/2026-09-21-borrowed-polish.md
**Goal:** add six library-free UX polish items to the invitation SPA.
**Architecture:** all changes live in web/ SPA (Svelte 5 runes + tokens). CSS ambient for Ken Burns, native `<dialog>` for maps, one new canvas module for confetti, localStorage for the RSVP draft. API, schema, admin, content and deploy untouched.

## Global constraints

- Mobile only, kolom 430px, satu kolom.
- Token semantic saja di call site, tanpa hex/pixel mentah (H-47).
- `prefers-reduced-motion: reduce` mematikan Ken Burns dan confetti (G-43), wajib.
- Bahasa Indonesia, sentence case, tanpa kata INFJ.
- Tanpa dependensi baru.

## Task 1: countdown anti-drift + hero ken burns → verify: web build exit 0, bundle contains keyframes named `hero-zoom`

**Files:**
- Modify: `web/src/App.svelte:27`
- Modify: `web/src/App.svelte:355-363`

- [x] Step 1: At `web/src/App.svelte:27`, change the timer to resync on the second boundary:
  `const timer = setInterval(() => (now = Date.now()), 1000 - (Date.now() % 1000));`
- [x] Step 2: Add a hero ambient zoom layer. After the `.hero { ... }` block (`:355-363`), insert a `::before` pseudo-element layered behind the content with `@keyframes hero-zoom` from `scale(1)` to `scale(1.04)`, 14s ease-in-out infinite alternate, background a soft radial brand glow using `var(--color-fill-brand)`, and the whole `::before` + keyframes eligible only under `@media (prefers-reduced-motion: no-preference)`.
- [x] Step 3: Run `npm run build` (web).
- [x] Step 4: Confirm the bundled css contains `hero-zoom`.
- [x] Step 5: Commit `feat: anti-drift countdown and hero ambience`.

## Task 2: native dialog for the map → verify: web build exit 0 and a browser click on the location button shows an open dialog with an iframe carrying `src`

**Files:**
- Create: `web/src/lib/MapDialog.svelte`
- Modify: `web/src/lib/SectionSchedule.svelte:23`
- Modify: `web/src/lib/SectionSchedule.svelte:104`

- [x] Step 1: Create `web/src/lib/MapDialog.svelte`: `let dialog = $state()` and `let src = $state('')`; the dialog is a native `<dialog>` (bind via `bind:this`); export function `openMap()` that builds `src = 'https://maps.google.com/maps?q=' + encodeURIComponent(eventDetails?.venue ?? '') + '&output=embed'` (fallback string computed inside from a `venue` prop), sets it, then `dialog.showModal()`; inside the dialog place a close `<button>` labeled `Tutup` and an external `<a href={mapsUrl}>Buka di Google Maps</a>` with `target="_blank" rel="noreferrer"`; the iframe gets `title="Peta lokasi acara"`, `loading="lazy"`, `allowfullscreen`. Use only tokens for styling, border via `var(--color-accent-gold-weak)`.
- [x] Step 2: In `SectionSchedule.svelte:23` replace the plain `<a>` with a `<button class="loc-btn" type="button" onclick={mapDialog.openMap}>Buka lokasi di peta</button>` and mount `<MapDialog venue={event.venue} mapsUrl={event.mapsUrl} bind:this={mapDialog} />` near it. Remove the now-unused anchor? Keep the external link inside the dialog only, so the schedule form loses its old direct link.
- [x] Step 3: Style `.loc-btn` token-only as a text button (accent on hover, focus-visible token) at the `SectionSchedule.svelte:104` style slot.
- [x] Step 4: Run `npm run build` (web).
- [x] Step 5: Verify with agent-browser `http://localhost:8787/?cb=map1`; on the schedule section, click the location button and evaluate `document.querySelector('dialog[open]') === null` returns false, and the iframe inside has a non-empty `src`.
- [x] Step 6: Commit `feat: native map dialog with lazy iframe`.

## Task 3: rsvp draft saved to localStorage → verify: web build exit 0 and a typed name survives a page reload

**Files:**
- Modify: `web/src/lib/SectionRsvp.svelte:5-33`
- Modify: `web/src/lib/SectionRsvp.svelte:82`

- [x] Step 1: Add `const DRAFT_KEY = 'weddu-rsvp-draft';`.
- [x] Step 2: Add `onMount` that reads `localStorage.getItem(DRAFT_KEY)`, parses it, and hydrates `name`, `attendance`, `guests` and `phone` runes (guarded parse, ignore on invalid).
- [x] Step 3: On `blur` of each of the four fields, write `{ name, attendance, guests, phone }` to localStorage; keep it cheap by saving the current runes, not the event.
- [x] Step 4: In the success path of `submit()` (the branch that sets `summary` to the success kind at `:55-60`), `localStorage.removeItem(DRAFT_KEY)`.
- [x] Step 5: Run `npm run build` (web).
- [x] Step 6: Verify with agent-browser: fill the name input, reload the page, eval the input value equals the typed string.
- [x] Step 7: Commit `feat: persist rsvp draft`.

## Task 4: diy canvas heart confetti on rsvp yes → verify: web build exit 0 and a submitted Yes form creates a canvas element

**Files:**
- Create: `web/src/lib/confetti.ts`
- Modify: `web/src/lib/SectionRsvp.svelte:33-60`

- [x] Step 1: Create `web/src/lib/confetti.ts` exporting `burstHearts()`: bail out immediately when `matchMedia('(prefers-reduced-motion: reduce)').matches`; create a fixed `canvas` covering the viewport with `pointer-events: none`, `position: fixed`, `inset: 0`, `z-index` above content; spawn about 40 heart particles (SVG-style two-bezier heart path drawn per frame on a 2d context); animate with `requestAnimationFrame` roughly 60 frames, fading and rising; remove the canvas and cancel the rAF on completion.
- [x] Step 2: In `SectionRsvp.svelte` import `burstHearts`; in the success branch of `submit()`, only when the stored attendance equals `'yes'`, call `burstHearts()`.
- [x] Step 3: Run `npm run build` (web).
- [x] Step 4: Verify with agent-browser on `http://localhost:8787/?cb=cf1`: fill a unique name plus attendance `Ya`, submit, and within 2 seconds eval that `document.querySelectorAll('canvas').length` is at least 1.
- [x] Step 5: Commit `feat: canvas heart confetti on yes'.

## Task 5: three-state submit button → verify: web build exit 0 and after a successful post the button is not busy and the success summary is present

**Files:**
- Modify: `web/src/lib/SectionRsvp.svelte:147-148`
- Modify: `web/src/lib/SectionRsvp.svelte:76-80`

- [x] Step 1: Add `let sent = $state(false)`; on successful submit set `sent = true` and schedule `setTimeout(() => (sent = false), 3000)`.
- [x] Step 2: Replace the button label block `:147-148` so it renders `Menyimpan...` while sending, `Terkirim` after success, and `Kirim konfirmasi` otherwise, keeping `aria-busy={submitting}`.
- [x] Step 3: Keep the existing `role="status"` summary paragraph as the live region for the success text.
- [x] Step 4: Run `npm run build` (web).
- [x] Step 5: Verify with agent-browser after a successful submit: the button `ariaBusy` is `'false'` and a `.summary[role="status"]` element exists.
- [x] Step 6: Commit `feat: three-state submit button`.

## Task 6: regression + merge + deploy → verify: web build exit 0, api `npm test` exit 0, guest flow works, admin unaffected, CI green, prod 200

**Files:**
- Modify: none (verification and release only)

- [x] Step 1: Run `npm run build` (web) and `npm test` (api).
- [x] Step 2: agent-browser regression on `http://localhost:8787`: post a guest book message, send an RSVP, open `#/admin`, log in with the known password, confirm the admin list renders and the invite page does not.
- [x] Step 3: Merge the branch into `main` (ff) and push `origin main`.
- [x] Step 4: Wait for the deploy workflow run to end with conclusion `success`.
- [x] Step 5: `Invoke-WebRequest https://api.ubdaw.workers.dev` returns HTTP 200 and the body contains `Undangan`.
- [x] Step 6: Commit leftover plan ticks and push.
