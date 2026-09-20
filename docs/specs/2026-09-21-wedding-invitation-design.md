---
title: Wedding invitation site Ubaid & Sofia
date: 2026-09-21
status: approved
---

# Wedding invitation site Ubaid & Sofia: Design

## Problem

Build a custom, single-use digital wedding invitation for the couple Ubaid and Sofia. It must be mobile-first, feel fast on cheap phones, use smooth animation including framebyframe PNG sprites, and let the couple read RSVP answers and guest book messages. Backend data lives in Neon via Drizzle, one admin password guards the small admin screen, everything deploys to a single Cloudflare Worker wired to a GitHub repository.

## Goals

1. The invitation opens in a phone browser and plays an animated envelope intro before showing content.
2. Every section of the classic flow is present: hero names and date, countdown, couple bios, love story, event schedule with maps, gallery, RSVP form, guest book, closing, music toggle.
3. RSVP answers and guest book messages persist to Neon and appear in the admin screen.
4. The admin screen is reachable only with the single password stored in a worker secret env, never in the repo.
5. The site loads fast enough to feel instant on a midrange Android phone on 4G.
6. Content is editable in one config file without touching admin, so the couple can change dates or maps with a commit.
7. The whole repo deploys from GitHub to Cloudflare Workers with one workflow.

## Non-goals

N/A for multi-tenant SaaS: this is a single-use site. No AI generation, no WhatsApp sending service (only a share link), no push notifications, no video backgrounds.

## Constraints

- Mobile-only layout, portrait card style. Desktop shows the phone-width column centered.
- Deployment target is Cloudflare Workers, not Pages. Repo is on GitHub.
- Database is Neon, ORM is Drizzle, server stack is Hono, frontend is Svelte 5 with Vite.
- No Better Auth. Admin auth is a single password.
- UI tokens come from jig. Animation uses CSS, a small amount of custom JS, dotLottie for the envelope, and PNG sprite sheets for character animation. No GSAP, no Framer Motion.

## Approach

Rekayasa arsitektur single Worker Hono yang menyajikan file statis Svelte 5 dan route API /api.

- Single GitHub repo with two folders: `web/` (Svelte 5 + Vite, static build output) and `api/` (Hono app). One Cloudflare Worker serves `/api/*` and the built SPA through an assets binding. One deploy, one domain.
- Schema in Drizzle: table `guests` (name, attendance yes/no/maybe, guest count, phone optional, created at) and table `messages` (name, message, hearts, created at).
- Admin password is one secret `ADMIN_PASSWORD` set with `wrangler secret put`. Login at `/api/admin/login` sets an httpOnly, Secure, SameSite cookie carrying an HMAC-signed token via WebCrypto. Login is rate limited to 5 tries per IP per 15 minutes.
- Invitation content lives in `web/src/content.ts`. The couple edits that file to change names, dates, venue, maps, gallery and music. Admin only reads RSVP and messages.
- Build order: scaffold repo and schema first, then the visible SPA against mock data, then wire the API, then admin and deploy last. The rationale from the design conversation: the backend skeleton is small and locks the data contract, but admin and auth are worthless before the invite looks good.

Pushback from design conversation: the user was offered a lighter version (single password instead of Better Auth) and chose it. The full multi-user auth stack was intentionally dropped.

## Alternatives considered

- Better Auth instead of the single password. Rejected by the user: one admin never needs a session framework.
- Next.js on Cloudflare. Rejected: needs the OpenNext adapter and is heavier than a plain Svelte 5 SPA plus Hono worker.
- GSAP for scroll choreography. Rejected for weight. CSS, IntersectionObserver, dotLottie and sprite sheets cover the effects that matter on mobile.
- Static site with RSVP in Google Sheets. Rejected: the user wants Drizzle and Neon in the stack.

## Testing

- Small vitest suite for the API: RSVP input validation, name and message length limits, rate limiter behaviour, admin login accept and reject.
- A smoke check against `wrangler dev` proving the worker returns the SPA and answers /api.
- Manual device checklist run once on a real phone: open cover, music toggle, RSVP submit, guest book submit, admin login and message moderation.

## Content decisions (from review)

- Event is called Ngunduh Mantu, a Javanese wedding reception. Invitation header says Undangan Ngunduh Mantu, not wedding.
- Event runs 7 to 8 October 2026 from 09.00 until end. Main ceremony day is 8 October.
- Venue: Balai Desa Kalurahan Giripurwo. Maps URL: https://maps.app.goo.gl/SZFx3jEad7dZwmvi8
- Gallery and couple photos: placeholder images from Pexels.
- Couple personalities: Ubaid is INFJ-A, Sofia is INFJ-T. Love story and closing text lean reflective and quietly warm, written by the implementer. The letters INFJ must not appear anywhere.
- Music: YouTube URL https://www.youtube.com/watch?v=1892ujwIooo, embedded as a YouTube iframe player.
- Theme: jade and cream with gold accents, chosen during the jig init interview.
- Sprite illustrations: free assets from free sources, or simple CSS shapes. No commercial assets.
- WhatsApp share number: dummy value until the real number arrives.

## Open questions

None blocking. Real WhatsApp number still pending but a dummy value is fine to ship with.