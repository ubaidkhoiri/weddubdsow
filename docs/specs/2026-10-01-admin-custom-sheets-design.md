---
title: Admin tab sheets custom bebas
date: 2026-10-01
status: approved
---

# Admin tab sheets custom bebas: Design

## Problem
Admin hanya kelola Pesan dan RSVP yang skemanya tetap. Catatan bebas fleksibel tidak punya wadah sehingga harus numpang di luar aplikasi.

## Goals
- Tab Sheets muncul di nav bawah sejajar Pesan dan RSVP dan Ringkasan. Kriteria lolos saat klik tab Sheets tampilkan daftar sheet dan status aktif terbaca.
- Pengguna bisa buat sheet baru berjudul bebas dan ganti nama dan hapus dengan konfirmasi. Kriteria lolos saat buat dan hapus ubah daftar tanpa muat ulang.
- Sheet tampil sebagai grid kosong dengan header kolom A B C dan nomor baris. Ukuran awal 8 kolom dan 15 baris. Kriteria lolos saat sel A1 sampai H15 tampil dan bisa diklik.
- Sel bisa diketik langsung dan tersimpan otomatis. Kriteria lolos saat muat ulang browser nilai sel tetap ada.
- Kolom bisa tambah di kanan dan sisip kiri dan hapus. Baris bisa tambah di bawah dan sisip atas dan hapus. Kriteria lolos saat tiap aksi ubah grid tanpa muat ulang.
- Ekspor sheet aktif ke CSV yang terunduh. Kriteria lolos saat berkas CSV berisi nilai tampil.
- Kondisi kosong tampil beda dari kondisi galat baca simpan lokal. Kriteria lolos saat tiap kondisi punya pesan dan satu aksi.

## Non-goals
- Rumus sel dan gabung sel dan filter dan urut. Alasan target hanya catat bebas.
- Sinkron server dan multi device. Alasan butuh tabel baru plus migrasi Neon dan risiko data produksi. Jadi follow up terpisah.
- Kolaborasi waktu nyata. Alasan di luar kebutuhan undangan.
- Impor CSV. Alasan bisa susul setelah ekspor stabil.

## Constraints
- Svelte 5 runes di `web/src/routes/admin.svelte` dan `web/src/lib/AdminNav.svelte`.
- Tanpa dependensi baru di `web/package.json`.
- Token semantik Jig tanpa nilai mentah di call site.
- Bahasa Indonesia yang jelas.
- Simpan lokal di localStorage dengan kunci namespaced per sheet.
- Tipe tab di `web/src/lib/AdminNav.svelte:2` bertambah satu literal.
- Inferensi mode satu baris. Admin adalah operator karena isi berupa baris dan kolom dan target throughput.

## Approach
Bangun komponen `CustomSheets` yang tiru pola `AdminGrid` yaitu definisi kolom dinamis dan toolbar dan aksi baris. Bedanya kolom bebas tambah dan hapus dan header notasi A1. State berupa peta sheet berisi judul dan matriks sel. Tiap ketik debounce simpan ke localStorage. Tab baru bernama Sheets di nav dan view di admin yang sembunyikan grid Pesan dan RSVP saat aktif. Tanpa ubah API dan tanpa migrasi.

## Alternatives considered
- Tabel database baru plus API CRUD. Tolak untuk tahap ini karena butuh migrasi produksi dan auth admin untuk data bebas plus waktu lebih lama. Catat sebagai follow up.
- Pakai SvGrid atau RevoGrid untuk sheet bebas. Tolak karena dep baru dan overkill untuk catat sederhana plus tema Jig lebih berat daripada bangun sendiri.
- Satu sheet tunggal tanpa daftar. Tolak karena pengguna minta buat sheet baru jamak.

## Testing
- `npm run build` di `web` lolos tanpa galat.
- Daftar periksa manual yaitu buat sheet tampil di daftar, ketik sel lalu muat ulang nilai tetap, tambah dan sisip dan hapus kolom dan baris, hapus sheet minta konfirmasi, CSV terunduh berisi nilai, simpan lokal penuh tampil pesan galat.

## Open questions
- N/A. Asumsi simpan lokal diputuskan sepihak karena perintah lanjut tanpa jawab dan tercatat di sini sebagai follow up sinkron server.
