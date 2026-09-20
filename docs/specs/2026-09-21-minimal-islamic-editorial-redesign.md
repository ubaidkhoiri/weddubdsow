---
title: minimal-islamic-editorial-redesign
date: 2026-09-21
status: approved
---

# Minimal Islamic Editorial Redesign: Undangan Ngunduh Mantu

## Problem

Current UI uses a jade + gold ornament editorial theme. User wants a full
overhaul to a "Minimal Islamic Editorial / Soft Spiritual Utility" style:
calm, personal, warm, spacious, mobile-first, with quiet and subtle Islamic
identity. Illustration and animation must use free Lottie assets (rings,
crescent) or outline monochrome icons.

## Goals

1. Every screen uses the new palette: `--color-bg-base` #FAF8F4, `--color-bg-raised` #FFFFFF, `--color-bg-fill` #F5F2EC, `--color-text-strong` #252522, `--color-text-weak` #77746D, `--color-text-muted` #AAA69D, `--color-stroke-strong` #E8E4DC, rose brand #D97A7A (+soft #F5DFDC, dark #A95353). No jade, no gold remains. Observable: `grep -r "brand-h\|accent-gold\|jade" web/src` returns nothing outside token files.
2. Typography is DM Sans (400/500/600/700), loaded from Google Fonts, replacing Cormorant Garamond everywhere. `--font-display` resolves to DM Sans. Observable: `grep -ri "cormorant" web/src` returns nothing.
3. Primary interactive color is `--color-text-strong` (near-black). Rose #D97A7A is decorative only (E-64 red-family). Primary button solid near-black bg with cream text. Observable: `--color-brand` never used on interactive elements.
4. Cover screen uses the free Lottie wedding rings animation as its focal element instead of the gold envelope seal; closing section gets a subtle crescent/star Lottie. Both play at most once per visitor and respect `prefers-reduced-motion` (G-43).
5. Envelope cover is simplified: rectangular card, tap to open, no clip-path flap. Gold removed.
6. All section components consume renamed tokens. No raw hex or pixel values at call sites (H-47). Border gold -> stroke-strong, numeral + eyebrow rose, timeline border rose-weak, schedule uses dividers not card grid.
7. Admin screen uses the same tokens, and the broken `--color-text-danger` reference becomes a valid token.
8. All icons are inline SVG, outline, 1.5px stroke, monochrome. No new icon dependency.

## Non-goals

- No new backend routes; API untouched except compile.
- No dark mode: forced light stays (color-scheme light, dark block inactive).
- No new animation library beyond the installed `@lottiefiles/dotlottie-wc`.
- No changes to content data (names, dates, venue, story, gallery urls) unless a token it consumes is removed.
- No restructuring of the 7-section flow or admin route.
- No change to the phone-width (.phone max-width 430px) canvas.

## Constraints

- `web/src/jig/theme.css` imports `brand.weddubdsow.css` + `mode.editorial.css`. The mode file stays; rewrite brand tokens in `brand.weddubdsow.css`.
- Jig rules apply fully: E-64 rose decorative only, E-65 one interactive color, A-04 no glassmorphism (remove `.fab` backdrop-filter), P-02 primary button solid, G-43 reduced motion, H-47 semantic tokens only.
- Lottie files must be vendored into `web/src/assets/` (free LottieFiles Simple License assets only).
- Prefers-reduced-motion and cover-once per visitor behavior must keep working.
- Skip button for cover: user can dismiss; hero dims until opened (existing behavior retained).

## Approach

Rewrite token layer in `web/src/jig/brand.weddubdsow.css`: new palette, DM Sans as font-display and font-text, rose brand tokens, stroke/bg/text scale. Remove gold tokens that components reference; update every component (App, 7 sections, admin) to the new names and styling. Vendor two free Lottie files into `web/src/assets/` (wedding rings for cover, crescent star for closing). Replace envelope gold seal with the rings Lottie. Replace all gold-weak/gold-text/gold usages with rose or stroke tokens. Convert countdown, petals, sprite, scroll-hint, fab to the quiet editorial style. Replace icons (loc-btn, heart, music, share) with inline SVG. Update admin `color-danger` token. Update DESIGN.md to the new system.

Order:
1. Tokens (brand file) + remove resizing text tokens if mode file covers DM Sans.
2. Lottie assets download + vendor.
3. Cover + hero + countdown in App.svelte.
4. SectionHeading + all sections.
5. Admin.
6. Copy + icons sweep.
7. DESIGN.md + sprites.css cleanup (petal sprite removed if unused).

## Alternatives considered

- Keep gold as the accent: rejected. User spec says "Islamic identity does not require green" and gold+green is the cliché to avoid; quiet near-black + rose fits the calm editorial direction.
- Use LottieFiles premium assets: rejected. Only free (Simple License) assets are allowed.
- Add lucide-svelte: rejected. Inline SVG is enough for the handful of icons, no new dependency (lazy rung 2/5).

## Testing

- `npm run build` in `web/` passes with no unused-token warnings the compiler can catch.
- `grep -ri "cormorant\|accent-\?gold\|jade\|brand-h" web/src` (excluding `web/src/jig` token files) returns nothing.
- `npx jig-ui@0.8.1 check` passes for mechanical rules; judgement self-check applied manually.
- Vite dev server renders: cover shows rings lottie, opens once, hero dims until open, countdown ticks, all sections styled, RSVP + messages submit, admin loads with same palette. Reduced-motion at OS level disables animations.
- 320px and 430px widths look right; desktop keeps the centered 430px column.

## Open questions

N/A: none blocked. Font weight subset and exact free Lottie URL confirmed during implementation.