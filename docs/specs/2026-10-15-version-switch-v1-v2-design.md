---
title: Version switch v1 v2
date: 2026-10-15
status: draft
---

# Version switch v1 v2: Design

## Problem
V1 undangan live dan stabil. Pemilik mau V2 wajah baru penuh dari nol untuk acara sama Ubaid Sofia. V1 wajib utuh sebagai arsip. URL utama wajib serve versi aktif dengan default V2. V1 dan V2 tidak boleh saling pengaruhi. Ganti versi wajib bisa dari admin area.

## Goals
- Arsip V1 tersedia di origin sebagai tag `v1-final` dan branch `archive/v1-minimal-islamic-editorial`. Kriteria lolos saat kedua ref bisa di fetch dari origin.
- URL root serve versi aktif dengan default V2. Kriteria lolos saat buka root tampil V2 dan override ke V1 tampil V1 identik lama.
- File V1 tidak berubah perilaku saat V1 aktif. Kriteria lolos saat countdown dan couple dan story dan schedule dan gallery dan rsvp dan messages dan closing dan admin lama tampil sama.
- Fitur RSVP dan pesan dan admin dipakai ulang di kedua versi. Kriteria lolos saat kirim RSVP dan kirim pesan dan login admin lolos di V1 dan V2.
- Admin bisa baca dan set versi aktif. Kriteria lolos saat set V1 lalu root tampil V1 dan set V2 lalu root tampil V2 tanpa deploy ulang.
- Tiap perubahan deploy lewat push main. Kriteria lolos saat workflow Deploy hijau dan Worker URL update.

## Non-goals
- Desain final visual V2. Alasan tahap ini sediakan placeholder plus infra switch. Desain V2 iterasi terpisah.
- Tema ketiga atau switch AB test. Alasan kebutuhan hanya dua versi.
- Dependensi UI baru. Alasan jaga build ringan dan Jig tetap sumber token.

## Constraints
- Svelte 5 runes di `web/src/App.svelte` dan `web/src/routes/admin.svelte`.
- Hono di `api/src/index.ts` dengan route di `api/src/routes/admin.ts`.
- Neon Postgres via Drizzle dengan skema di `api/src/schema.ts`.
- Tanpa dependensi baru di `web/package.json` dan `api/package.json`.
- V2 tidak impor interior V1. Berbagi hanya klien api di `web/src/lib/api.ts` dan konten di `web/src/lib/content.ts`.
- Workflow web only. Tiap tahap satu commit kecil lalu push main.
- Bahasa Indonesia yang jelas.

## Approach
Tahap arsip dulu lalu infra lalu V2. Arsip sudah jalan yaitu main fast forward ke `00873f2` lalu tag `v1-final` dan branch `archive/v1-minimal-islamic-editorial` dan push ketiganya. Backend tambah tabel `settings` kunci primer teks dan nilai teks. Tambah endpoint publik baca versi aktif dan endpoint admin baca tulis versi aktif dengan auth lama. Default versi adalah `v2` saat baris belum ada. Frontend ubah `web/src/App.svelte` jadi router tipis. Urutan resolusi yaitu param v lalu path v1 v2 lalu nilai backend lalu default v2. V1 tetap di file sekarang. V2 mulai sebagai komponen baru di folder `v2` dengan konten sama dari `content.ts`. Admin tambah kontrol versi aktif yang panggil endpoint admin. Rollback cukup set versi lewat admin atau revert commit.

## Alternatives considered
- Repo dan Worker baru untuk V2 dengan V1 beku. Tolak karena butuh secrets ulang dan domain baru dan pantau dua project. URL utama harus sama jadi opsi ini lebih mahal.
- Ganti total tanpa switch. Tolak karena tanpa rollback dan langgar permintaan V1 V2 tidak terpengaruh.
- Flag hanya di kode tanpa kontrol admin. Tolak karena tiap ganti versi butuh deploy. Permintaan eksplisit minta setting lewat admin.

## Testing
- `npm run build` di `web` lolos tanpa galat.
- `npm test` di `api` lolos tanpa galat.
- Daftar periksa manual yaitu root tampil versi aktif, override V1 tampil V1 lama, override V2 tampil placeholder baru, set versi dari admin ubah root tanpa deploy, kirim RSVP dan pesan lolos di kedua versi, muat ulang versi tetap.

## Open questions
- Arah visual V2 belum diputuskan. Placeholder dulu lalu iterasi setelah infra hijau.
