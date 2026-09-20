---
title: Borrowed polish (from dewanakl, heojay, sun-teru)
date: 2026-09-21
status: approved
---

# Borrowed polish: Design

## Problem

Studi tiga repo undangan (dewanakl, heojay, sun-teru) menemukan teknik kecil bebas
library yang menaikkan kualitas UX tanpa menambah dependensi. Dimasukkan ke undangan
Ubaid & Sofia.

## Goals

1. Countdown tidak melayang dari waktu nyata saat fase interval bergeser (predikat:
   selisih detik tick ke tick sama dengan detik nyata pada pengamatan browser).
2. Tombol "Buka lokasi di peta" membuka dialog native berisi peta; iframe peta baru
   diisi `src` saat dialog terbuka (predikat: dialog `open` dan iframe ber-`src`).
3. Hero punya Ken Burns slow zoom, mati saat `prefers-reduced-motion: reduce`
   (predikat: kelas zoom aktif pada viewport, aturan reduced-motion menghapusnya).
4. Konfirmasi RSVP "Ya" menembakkan burst hati canvas di atas layar, tanpa library,
   auto-hilang, mati saat reduced-motion (predikat: canvas muncul setelah submit Ya).
5. Tombol submit RSVP punya 3 state (kirim / mengirim / terkirim), umpan balik lewat
   `role=status` (predikat: live region menyebutkan berhasil).
6. Draft form RSVP tersimpan ke localStorage saat blur dan pulih saat reload, terhapus
   setelah berhasil terkirim (predikat: nilai input bertahan setelah reload, kosong
   setelah submit sukses).

## Non-goals

- Tidak menambah dependensi (tanpa AOS, tanpa canvas-confetti, tanpa Swiper, tanpa saos).
- Tidak mengubah API, skema DB, admin, konten, deploy.
- Tidak menambah section baru.
- Tidak mengubah teknik motion yang sudah ada (reveal, petal, sprite).

## Constraints

- Mobile only, kolom 430px.
- Token semantic saja di call site (H-47). Tanpa hex/pixel mentah.
- `prefers-reduced-motion: reduce` wajib mematikan Ken Burns dan confetti (G-43).
- Bahasa Indonesia, sentence case, tanpa INFJ.
- jQuery/Bootstrap tidak dipakai (berbeda konteks dari dewanakl).

## Approach

Empat dari tujuh ide terpilih, semuanya library-free:

1. Countdown anti-drift: interval `setInterval(() => ..., 1000 - (Date.now() % 1000))`
   menggantikan pengatur waktu tetap.
2. Map dialog: komponen `MapDialog.svelte` dengan `<dialog>` native; iframe
   `youtube-nocookie`-style peta Google diisi lazy lewat IntersectionObserver di dalam
   dialog yang terbuka.
3. Ken Burns: kelas CSS `scale(1.02)`, transisi 12s, ditoggle IntersectionObserver pada
   hero.
4. Confetti hati: modul `web/src/lib/confetti.ts` ~60 baris: kanvas fixed pointer-events
   none, path SVG hati, rAF burst 40 partikel, hapus kanvas setelah selesai, skip saat
   reduced-motion. Dipicu saat RSVP "Ya" sukses.
5. State tombol RSVP: runes `status: 'idle' | 'sending' | 'sent'`; `role=status` live
   region menyebutkan "Terima kasih, konfirmasi kehadiran terkirim."
6. Draft RSVP: `on:blur` simpan ke `localStorage['weddu-rsvp-draft']`; pulih di mount;
   hapus setelah sukses.

## Alternatives considered

- canvas-confetti (dewanakl): menambah library 60KB untuk efek yang 60 baris sendiri
  bisa lakukan. Ditolak, konsisten constraint tanpa dependensi.
- AOS: kita sudah punya reveal IntersectionObserver sendiri.
- Swiper thumbnail: galeri kita cukup grid + dialog lightbox.

## Testing

- `npm run build` (web) exit 0 tiap task.
- `npx jig-ui check` bersih tiap task yang menyentuh style.
- Verifikasi browser via agent-browser tiap task sesuai predikat Goals.
- Regresi akhir: alur tamu (RSVP, guest book), admin login, CI hijau, prod 200.

## Open questions

N/A

Design diasumsikan disetujui lewat instruksi user "silahkan plan dan kerjakan" (m00602).