---
title: Quiet luxury redesign undangan
date: 2026-09-21
status: draft
---

# Quiet luxury redesign undangan: Design

## Problem

UI undangan saat ini terlihat biasa: tiap section jadi kartu bertumpuk dengan
blok jade full-width yang berat, kesan template default, tipografi tidak punya
karakter display. Padahal konten, API, dan fitur sudah lengkap. Yang kurang
adalah bahasa visual yang premium.

## Goals

- Nama pasangan dan tiap heading memakai display serif Cormorant Garamond
  light italic. Terlihat di hero saat halaman dimuat.
- Tidak ada kartu bertumpuk di section internal. Section memakai hairline gold
  tipis dan whitespace lebar.
- Seluruh halaman tetap light mode (latar cream, teks gelap), admin tidak
  berubah.
- `npm run build` di web keluar exit 0, dan lima section penyusun (couple,
  story, schedule, gallery, closing) tetap ada di bundle.
- Perilaku berhenti bekerja dan tetap bekerja: form RSVP, guest book, admin,
  musik, share, countdown. Tidak diuji ulang penuh, hanya regresi lewat
  agent-browser.

## Non-goals

- Tidak ada perubahan API, skema Neon, admin, konten, workflow deploy.
- Tidak ada section baru dan tidak ada pemindahan urutan konten.
- Tidak ada GSAP atau Framer Motion. Stack motion tetap CSS + IntersectionObserver
  + sprite + petal.
- Tidak menambah halaman dark mode.

## Constraints

- Mobile only, kolom 430px, satu kolom (`.phone` di App.svelte).
- Token Jig hanya, nama semantik. Dilarang hex/pixel mentah di call site (H-47).
- Jade itu hijau: elemen dekoratif saja (E-64). Gold ornament, bukan interaktif
  (E-65). Interaktif pakai `--color-text-strong`.
- `prefers-reduced-motion: reduce` wajib mematikan reveal, sprite, dan petal
  (G-43).
- Bahasa Indonesia, sentence case, tanpa INFJ.
- Semua kontrol punya state hover, focus-visible, active (E-28), fokus tidak
  dihapus (E-29).

## Approach

Satu pendekatan restyle menyeluruh pada web/. Font display: Cormorant Garamond
light dan italic (keputusan user). Body tetap sans serif (sistem, 400 dan 600).

Hubungan antar unit: tiap section yang sudah ada diperbaiki gaya visualnya
secara mandiri lewat CSS di file masing-masing, dengan pola bersama di
`web/src/app.css` (tipografi global, hairline, eyebrow, numeral watermark).

- Tipografi global di `app.css`: font display dipasang lewat `@import` Google
  Fonts di `web/index.html` untuk Cormorant Garamond 300 light + italic 300,
  dan sans sistem untuk body. Nama dan heading memakai display font.
- Hero: eyebrow kapital jarang gold "NGUNDUH MANTU", nama serif raksasa `Ubaid`
  dan `Sofia` dengan ampersand gold, hairline gold, baris tanggal + venue.
- Tiap section: eyebrow (label kecil) + numeral gold halus (01, 02) + hairline,
  isi dibuka lebar dengan whitespace, bukan kotak.
- Schedule: dua hari jadi layout editorial, jam besar jelas, tanpa kartu.
- Gallery: gambar dengan frame tipis, stagger halus, quote pendek di sela.
- RSVP dan guest book: panel terang berbingkai hairline, tetap light.
- Closing: centered, italic, ampersand.
- Cover: amplop cream berbingkai hairline gold, segel lilin gold, postmark
  italic.
- Fab music/share: pill glass cream, ring gold saat focus.
- Motion: pergeseran naik 12px, durasi 600-800ms, easing tenang; petal dan
  sprite tetap ada tapi kalem; reduced-motion tetap patuh.

## Alternatives considered

- Playfair Display: lebih tegas dan kontras. User pilih Cormorant Garamond
  supaya kesannya halus dan ramping.
- Tetap tanpa display font: hanya tuning spacing dan warna. Tidak cukup
  mengubah kesan "biasa", jadi ditolak.
- Mode editorial sudah aktif sejak awal (theme.css import mode.editorial.css),
  jadi tidak perlu ganti mode, hanya perkuat penerapannya.

## Testing

- `npm run build` di web exit 0.
- `npx jig-ui check` tetap bersih setelah perubahan token.
- agent-browser ke dev server: hero memperlihatkan font display, tidak ada
  kartu bertumpuk, semua section tetap hadir, form RSVP dan guest book tetap
  bekerja (kirim pesan muncul di daftar).
- Regresi admin tidak disentuh: hanya cek halaman admin tetap bisa dibuka
  (login tampil).

## Open questions

- Judul permanen nama pasangan di logotype hero: apakah tetap memakai tanda
  ampersand gold atau kata "dan" biasa. Diputuskan saat implementasi jika user
  belum memilih, default ampersand sesuai paste.