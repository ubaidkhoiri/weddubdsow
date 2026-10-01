---
title: Admin login plus bottom nav plus modular sheets
date: 2026-10-01
status: approved
---

# Admin login plus bottom nav plus modular sheets: Design

## Problem
Login admin tanpa jalan pulang ke undangan dan tanpa kontrol kata sandi yang lengkap. Area admin satu daftar panjang tanpa navigasi antar dataset dan tanpa alat kerja data seperti cari dan saring dan urut dan ekspor. Skema database tetap sehingga kolom arbitrer butuh migrasi dan tidak bisa dibuat dari UI saja.

## Goals
- Login bisa kembali ke undangan lewat tautan dan tombol kembali peramban tanpa jebakan fokus. Kriteria lolos saat alur masuk dan keluar lewat keyboard dan pembaca layar terbaca.
- Medan kata sandi punya tampil dan sembunyi plus label persisten plus pesan galat yang jelas. Kriteria lolos saat submit salah menampilkan pesan dan nilai tidak hilang.
- Navigasi bawah melayang penuh membulat pindah antar Pesan dan RSVP dan Ringkasan. Kriteria lolos saat tiap tab punya status aktif yang terbaca dan posisi tetap di bawah saat gulir.
- Tiap dataset tampil sebagai kartu modular dengan bilah alat cari dan saring dan urut dan ekspor CSV. Kriteria lolos saat hasil saring dan jumlah baris terumumkan lewat live region.
- Baris bisa disisipkan di atas atau di bawah dan dihapus dengan konfirmasi bertingkat. Kriteria lolos saat tambah dan hapus mengubah daftar tanpa muat ulang penuh.
- Kolom bisa diubah lebar dan disusun ulang dan disembunyikan dengan preferensi tersimpan lokal. Kriteria lolos saat lebar dan urutan bertahan setelah muat ulang.
- Mode admin ikut operator yang padat dan cepat lewat keyboard. Kriteria lolos saat tabel punya urut dan saring dan visibilitas kolom dan identitas baris stabil.

## Non-goals
- Kolom database baru dari UI tanpa migrasi. Alasan butuh perubahan skema Drizzle plus migrasi Neon.
- Rumus sel dan gabung sel dan kolaborasi waktu nyata. Alasan kebutuhan undangan hanya 200 pesan dan 500 RSVP.
- Virtualisasi sejuta baris. Alasan beban nyata kecil sehingga paginasi plus batas server cukup.
- Tema gelap admin. Alasan produk undangan diputuskan terang saja.

## Constraints
- Svelte 5 dengan runes di `web/src/routes/admin.svelte` dan `web/src/App.svelte`.
- Tanpa dependensi baru di `web/package.json` dan `api/package.json`.
- Token semantik Jig saja tanpa heks mentah di call site.
- Bahasa Indonesia dengan kalimat jelas.
- Lebar ponsel 430px untuk undangan dan admin tetap bisa dipakai sempit.
- Batas API ada yaitu login 5 per 15 menit dan publik 30 per 60 detik.
- Cookie admin `weddu_admin` HMAC 7 hari di `api/src/admin.ts`.
- Validasi ada yaitu nama RSVP 120 dan tamu 1 sampai 5 dan telepon 20 dan nama pesan 60 dan pesan 500.
- Inferensi mode satu baris. Admin adalah operator karena isi berupa baris dan saring dan target throughput.

## Approach
Bangun tanpa mesin spreadsheet eksternal dengan inspirasi API SvGrid dan RevoGrid. Pola pil bawah undangan dipakai ulang untuk nav admin. Komponen `AdminGrid` menerima definisi kolom dan aksi baris sehingga Pesan dan RSVP dan Ringkasan berbagi satu tabel. API diperluas dengan cari dan saring dan paginasi plus hapus RSVP plus ubah terbatas. Ekspor CSV jalan di klien dari data tampil. Preferensi kolom tersimpan di localStorage. Audit keamanan jalan sesudah fitur dan temuan langsung jadi tugas perbaikan.

## Alternatives considered
- Pakai SvGrid MIT yang Svelte 5 native dengan virtualisasi dan saring Excel. Tolak karena 80KB gzip plus ekspor dan impor di edisi perusahaan sehingga overkill untuk 700 baris.
- Pakai RevoGrid ringan dengan ubah ukuran dan semat dan ekspor CSV gratis. Tolak karena basis web component non Svelte sehingga adaptor dan tema Jig lebih berat daripada bangun sendiri.
- Pakai Handsontable dengan rumus terkaya. Tolak karena lisensi komersial dan tanpa build Svelte native.
- Tetap daftar tunggal tanpa nav dan tanpa grid. Tolak karena tidak menjawab permintaan navigasi dan kerja data.

## Testing
- `npm run build` di `web` lolos tanpa galat.
- `npm test` di `api` lolos.
- Daftar periksa manual yaitu kata sandi salah tampil pesan dan nilai bertahan, tautan pulang ke `#/` bekerja, tab bawah pindah dengan status aktif, cari dan saring mengubah jumlah, ubah lebar dan urutan bertahan, tambah di atas dan di bawah bekerja, hapus minta konfirmasi lalu hilang, CSV terunduh, kondisi kosong dan muat dan galat tampil beda.

## Open questions
- N/A. Ruang lingkup diputuskan yaitu skema tetap tanpa kolom database arbitrer.
