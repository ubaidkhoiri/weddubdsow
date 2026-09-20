# Design system: Undangan Ngunduh Mantu

Source of truth untuk semua UI. Token layer ada di `web/src/jig`, di-generate oleh
`jig init` (Jig v0.16.1). Baca file ini sebelum kerja frontend.

## Brand

- Jade (`--color-brand`, hsl 158 38% 34%). Jade itu hijau, jadi per rule E-64 brand
  ini DECORATIVE ONLY. Elemen interaktif (link, tombol utama) pakai
  `--color-text-strong`.
- Cream: `--color-bg-base` (warm off-white). Kartu `--color-bg-raised`.
- Gold ornament: `--color-accent-gold`, `--color-accent-gold-weak`,
  `--color-accent-gold-glow`. Hanya aksen garis, segel, kilau. Tidak pernah
  interaktif (E-65).
- Mode: editorial dipakai seluruh SPA undangan (`theme.css` import
  `mode.editorial.css`). Admin nanti di-scope token sendiri.

## Aturan pakai

- Konsumsi token pakai nama semantik (`--color-text-strong`, `--spacing-m`).
  Dilarang hex/pixel mentah di call site (H-47).
- Satu alignment per komponen. Prosa rata kiri, measure-capped (B-11, B-12).
- Spacing naik dari dalam ke luar (D-69). Heading: space atas > bawah 2-3x (D-24).
- Dua weight font: 400 dan 600 (B-77). Long-form ≥18px (B-75).
- Semua kontrol: state hover, focus-visible (token `--color-focus`), active,
  disabled (E-28). Fokus tidak boleh dihapus tanpa pengganti (E-29).
- Form: label persisten di atas field (F-36, F-98), mark required + optional (F-97).
- Warna error/warning/success semantic token, tidak pernah dipakai dekoratif (C-22).
- Radius: `--radius-control` untuk kontrol, `--radius-surface` untuk container (A-07).

## Motion

- Stack: CSS transition + IntersectionObserver reveal + sprite sheet (CSS `steps()`)
  + dotLottie untuk envelope intro. Tanpa GSAP, tanpa Framer Motion.
- Entrance animation: sekali per visitor, bisa di-skip (G-42). Hero envelope
  re-play tidak boleh tiap load.
- `prefers-reduced-motion: reduce` wajib: matikan reveal dan sprite (G-43).
- Interaksi feedback 100-200ms (G-44). Ambient motion (petals, kilau) lambat dan
  hanya berlaku mode editorial.

## Layout

- Mobile only, kolom 430px, konten 1 kolom (`.phone` di App.svelte).
- Tanpa horizontal scroll region di mobile (M-01).

## Copy

- Bahasa Indonesia. Sentence case. Error message berisi instruksi, bukan vonis (F-37).
- Jangan pernah menulis kata INFJ di mana pun.