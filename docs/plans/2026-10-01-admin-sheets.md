# Admin sheets: Implementation Plan

**Spec:** docs/specs/2026-10-01-admin-sheets-design.md
**Goal:** Login rapi plus nav bawah plus grid kartu modular siap produksi
**Architecture:** Shell admin dengan tiga tab dan satu komponen grid yang dipakai ulang untuk Pesan dan RSVP dan Ringkasan. API tetap Hono plus Drizzle dengan tambah cari dan paginasi dan hapus RSVP dan ubah terbatas. CSV dan preferensi kolom jalan di klien.

## Global constraints
- Svelte 5 runes di web/src/routes/admin.svelte dan web/src/App.svelte
- Tanpa dependensi baru di web/package.json dan api/package.json
- Token semantik Jig tanpa nilai mentah di call site
- Bahasa Indonesia yang jelas
- Cookie weddu_admin HMAC 7 hari
- Batas login 5 per 15 menit dan publik 30 per 60 detik

### Task 1: Login esensial pulang plus aksesibilitas → verify: build web lolos dengan status keluar nol

**Files:**
- Modify: `web/src/routes/admin.svelte`

- [ ] Step 1: Tambah tautan pulang ke `#/` di atas kartu plus tombol kembali yang sama. Jaga fokus ke judul saat rute admin dibuka.
- [ ] Step 2: Tambah tampil dan sembunyi kata sandi dengan `type` yang berganti dan `aria-label` yang ikut berganti. Pertahankan nilai saat galat dan umumkan galat lewat `aria-live`.
- [ ] Step 3: Perbaiki tombol masuk ke token teks kuat dengan cincin fokus yang terlihat. Pisahkan hapus sebagai aksi tersier.
- [ ] Step 4: Run `npm run build` di `web`
- [ ] Step 5: Commit

### Task 2: Cangkang admin plus nav bawah melayang → verify: berkas nav ada dan build web lolos dengan status keluar nol

**Files:**
- Create: `web/src/lib/AdminNav.svelte`
- Modify: `web/src/routes/admin.svelte`
- Modify: `web/src/App.svelte`

- [ ] Step 1: Buat `AdminNav` sebagai pil bawah penuh membulat dengan tiga tombol yaitu Pesan dan RSVP dan Ringkasan. Tandai aktif lewat `aria-current`. Buat lengket bawah dengan lapisan overlay.
- [ ] Step 2: Pindah logika tab di `admin.svelte` ke status tab yang dikontrol nav. Pastikan konten gulir tidak tertutup nav lewat bantalan bawah.
- [ ] Step 3: Jaga pola pil undangan tetap utuh dan tidak digandakan di luar admin.
- [ ] Step 4: Run `npm run build` di `web`
- [ ] Step 5: Commit

### Task 3: API cari plus paginasi plus hapus RSVP plus ubah terbatas → verify: tes API lolos dan login salah berstatus HTTP 401

**Files:**
- Modify: `api/src/routes/admin.ts`
- Modify: `api/src/lib/validate.ts`
- Modify: `api/src/index.test.ts`

- [ ] Step 1: Tambah query `q` dan `attendance` dan `page` dan `limit` untuk GET pesan dan RSVP dengan batas atas yang aman. Kembalikan total dan halaman bersama baris.
- [ ] Step 2: Tambah DELETE RSVP per id dengan otorisasi admin dan konfirmasi di klien. Tambah PATCH terbatas untuk pesan dan RSVP dengan validasi yang sama seperti buat.
- [ ] Step 3: Tambah tes untuk tolak tanpa cookie dan tolak kata sandi salah dan lolos tambah dan hapus pesan.
- [ ] Step 4: Run `npm test` di `api`
- [ ] Step 5: Commit

### Task 4: Grid kartu modular plus toolbar plus ekspor → verify: build web lolos dan jumlah definisi kolom di berkas grid minimal 1

**Files:**
- Create: `web/src/lib/AdminGrid.svelte`
- Modify: `web/src/routes/admin.svelte`

- [ ] Step 1: Buat `AdminGrid` dengan definisi kolom yaitu kunci dan label dan lebar dan mode urut. Dukung klik header untuk urut dan gagang seret untuk lebar dan menu sembunyi dan pindah kiri dan kanan.
- [ ] Step 2: Tambah bilah alat yaitu cari dan saring kehadiran dan ekspor CSV dari data tampil dan tambah baris dan tinggi baris rapat dan nyaman. Bedakan kondisi muat dan kosong awal dan kosong saring dan galat.
- [ ] Step 3: Tambah aksi baris yaitu sisip di atas dan sisip di bawah dan hapus dengan dialog konfirmasi sedang dan edit sel terbatas dengan validasi. Simpan lebar dan urutan dan sembunyi di localStorage per dataset.
- [ ] Step 4: Pakai token operator yang padat dengan target sentuh tetap dan angka tabular dan waktu absolut presisi. Umumkan jumlah hasil lewat live region.
- [ ] Step 5: Run `npm run build` di `web`
- [ ] Step 6: Commit

### Task 5: Audit ulang plus perbaiki weakspot → verify: tes API lolos dan tidak ada pola larangan pada berkas admin

**Files:**
- Modify: `api/src/middleware.ts`
- Modify: `api/src/routes/messages.ts`
- Modify: `web/src/routes/admin.svelte`

- [ ] Step 1: Audit batas laju memori dan kunci IP dan tambah batas hapus admin. Audit CORS agar hanya localhost dan workers dev yang lolos.
- [ ] Step 2: Audit endpoint hati agar tidak bisa dipompa tanpa batas dan audit hapus agar id tidak valid ditolak. Audit cookie agar aman di HTTPS dan SameSite ketat.
- [ ] Step 3: Perbaiki temuan lewat perubahan kecil tanpa ubah perilaku publik. Tambah pesan galat yang menyebut aksi perbaikan.
- [ ] Step 4: Run `npm test` di `api`
- [ ] Step 5: Commit
