# Design system: Undangan Ngunduh Mantu

Source of truth untuk semua UI. Token layer ada di `web/src/jig`, di-generate oleh
`jig init` (Jig v0.16.1). Baca file ini sebelum kerja frontend.
Arah desain: **Minimal Islamic Editorial** (spec 2026-09-21-minimal-islamic-editorial-redesign).

## Brand

- Rose accent (`--color-brand`, hsl 0 66% 66% = #D97A7A, muted). Hue 0 masuk
  keluarga merah, jadi per rule E-64 brand ini DECORATIVE ONLY. Elemen interaktif
  (link, tombol utama) pakai `--color-text-strong`.
- Variasi rose: `--color-text-brand` #A95353 (eyebrow, date, caption teks, kontras
  ≥ 4.5:1 di cream), `--color-stroke-brand-weak` (timeline, numeral),
  `--color-fill-brand` #F5DFDC (wash).
- Cream base: `--color-bg-base` #FAF8F4, kartu `--color-bg-raised` #FFFFFF,
  fill tipis `--color-fill` #F5F2EC.
- Neutrals: `--color-text-strong` #252522, `--color-text-weak` #77746D,
  `--color-text-muted` #AAA69D (dekoratif, tanpa floor), `--color-stroke-weak`
  #E8E4DC (divider), `--color-stroke-strong` (input border/icon ≥ 3:1).
- Mode: editorial dipakai seluruh SPA undangan (`theme.css` import
  `mode.editorial.css`). Admin memakai token yang sama.
- Forced light: undangan light-only. `color-scheme: light` di brand css.
  Sistem gelap (termasuk iOS dark) tidak memengaruhi tampilan. Hook
  `:root[data-theme="dark"]` dibiarkan ada untuk toggle masa depan, tidak aktif.

## Typografi

- Satu wajah: DM Sans (`--font-text` dan `--font-display`). Dimuat dari Google
  Fonts (opsz 9..40, wght 400/500/600/700) di `web/index.html`.
  Tanpa font italic; tanpa Cormorant.
- Umbri: 400 dan 600 saja (B-77). Hierarchy dari size, spacing, weight, colour.

## Ilustrasi dan motion

- Lottie: `web/public/rings.lottie` (Wedding Rings, dotLottie 2KB, free
  LottieFiles Simple License) dipakai sebagai focal cover. Di-render lewat
  `<dotlottie-wc>` dengan `filter: invert(1)` agar putih jadi warna teks.
  Crescent closing = ikon SVG inline (garis 1.5px), bukan lottie (lottie free
  yang ada terlalu ornamentik / berat).
- Stack: CSS transition + IntersectionObserver reveal + dotLottie cover.
  Tanpa GSAP, tanpa Framer Motion.
- Entrance animation: sekali per visitor, bisa di-skip (G-42).
- `prefers-reduced-motion: reduce` wajib: matikan reveal dan lottie (G-43).
- Interaksi feedback 150-250ms (G-44). Tidak ada petal, tidak ada sprite,
  tidak ada ambient fall (petals dihapus dalam redesign ini).

## Layout

- Mobile only, kolom 430px, konten 1 kolom (`.phone` di App.svelte).
- Tanpa horizontal scroll region di mobile (M-01).
- Desember: desktop tetap kolom 430px di tengah, tidak jadi dashboard.

## Komponen

- Button primary: full width, height 48px, radius `--radius-control` (12px),
  solid `--color-text-strong` + teks `--color-bg-base`. Sekunder: text/ghost.
- Input/select/textarea: 48px, radius `--radius-control`, border
  `--color-stroke-strong`, focus-fill ring `--color-focus`.
- Card jarang: divider `--color-stroke-weak` lebih disukai. Radius container
  `--radius-surface` (16px).
- Numeral 01-05 dekoratif pakai `--color-stroke-brand-weak`, tabular-nums.

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

## Copy

- Bahasa Indonesia. Sentence case. Nada hangat, reflektif, tanpa vonis.
  Cari makna pelan, bukan membangun rasa bersalah.
- Error message berisi instruksi, bukan vonis (F-37).
- Jangan pernah menulis kata INFJ di mana pun.