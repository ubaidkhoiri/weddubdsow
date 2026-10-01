# Admin tab sheets custom bebas: Implementation Plan

**Spec:** docs/specs/2026-10-01-admin-custom-sheets-design.md
**Goal:** Tab Sheets bebas di admin dengan simpan lokal dan tanpa sentuh API.
**Architecture:** Komponen CustomSheets tiru pola AdminGrid dengan kolom dinamis dan header A1. State peta sheet dan matriks sel simpan debounce ke localStorage. Tab baru di AdminNav dan view di admin yang sembunyikan grid saat aktif.

## Global constraints
- Svelte 5 runes di web/src/routes/admin.svelte dan web/src/lib/AdminNav.svelte
- Tanpa dependensi baru di web/package.json
- Token semantik Jig tanpa nilai mentah di call site
- Bahasa Indonesia yang jelas
- Simpan lokal di localStorage kunci namespaced per sheet
- Tipe tab di web/src/lib/AdminNav.svelte:2 bertambah satu literal

### Task 1: Mesin sheets bebas → verify: build web exit 0 dan berkas komponen ada

**Files:**
- Create: `web/src/lib/CustomSheets.svelte`

- [ ] Step 1: Buat CustomSheets dengan daftar sheet tambah ganti nama hapus konfirmasi, grid 8 kolom 15 baris header A1, sel klik ketik simpan debounce localStorage, tambah sisip hapus kolom dan baris, ekspor CSV, kosong dan galat simpan punya pesan dan aksi. Ikuti token AdminGrid dan tanpa nilai mentah.
- [ ] Step 2: Run `npm run build` di `web`
- [ ] Step 3: Commit

### Task 2: Wiring tab Sheets → verify: build web exit 0 dan jumlah tab minimal 4

**Files:**
- Modify: `web/src/lib/AdminNav.svelte:1-30`
- Modify: `web/src/routes/admin.svelte:1-60`

- [ ] Step 1: Tambah literal sheets ke tipe AdminTab dan entri tombol Sheets di nav sejajar tiga tab lama.
- [ ] Step 2: Render CustomSheets saat tab aktif dan sembunyikan grid Pesan RSVP dan jaga toolbar dan logout tetap jalan.
- [ ] Step 3: Run `npm run build` di `web`
- [ ] Step 4: Run cari jumlah literal tab dan pastikan minimal 4
- [ ] Step 5: Commit
