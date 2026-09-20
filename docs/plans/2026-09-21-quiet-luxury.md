# Quiet Luxury Redesign: Implementation Plan

**Spec:** docs/specs/2026-09-21-quiet-luxury-redesign.md
**Goal:** rombak visual web/ ke bahasa quiet luxury light mode tanpa ubah API, konten, admin, atau deploy.
**Architecture:** restyle murni frontend. Font display Cormorant Garamond light+italic lewat Google Fonts di index.html, token font di brand, chrome section dipusatkan di satu komponen SectionHeading, tiap section sisanya adalah edit CSS di file masing-masing. Perilaku (RSVP, guest book, musik, admin, countdown) tidak bersentuhan.

## Global constraints

- Mobile only, kolom 430px, satu kolom (`.phone` dan `#app` di web/src/App.svelte:18-21, 163).
- Font display Cormorant Garamond 300 (light) dan 300 italic. Body sans sistem 400 dan 600.
- Token Jig, nama semantik. Dilarang hex/pixel mentah di call site (H-47). Angka yang dipakai pun token yang sudah ada.
- Jade dekoratif hanya (E-64), gold ornamental bukan interaktif (E-65), interaktif `--color-text-strong`.
- `prefers-reduced-motion: reduce` mematikan reveal, sprite, petal (G-43).
- Bahasa Indonesia, sentence case, tanpa INFJ.
- Status kontrak desain: spec approved. Admin tetap scoped terpisah, tidak diubah.

---

### Task 1: Foundation tipografi → verify: `npm run build` (web) exit 0; `web/dist/index.html` mengandung string `Cormorant`; `npx jig-ui check` bersih tanpa findings.

**Files:**
- Modify: `web/index.html:6-12`
- Modify: `web/src/jig/brand.weddubdsow.css:64`
- Modify: `web/src/app.css:12-23`
- Modify: `web/src/App.svelte:163-242`

- [ ] Step 1: Di `web/index.html`, ganti blok head jadi preconnect + stylesheet Cormorant. Setelah baris `<meta name="viewport" ...>` tambahkan:
      ```html
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap"
        rel="stylesheet"
      />
      ```
- [ ] Step 2: Di `web/src/jig/brand.weddubdsow.css` setelah `--color-accent-gold-glow` (baris 64) tambahkan token keluarga font:
      ```css
      --font-display: "Cormorant Garamond", Georgia, serif;
      ```
- [ ] Step 3: Di `web/src/app.css` ganti selector body menjadi body sans sistem dengan margin 0, lalu tambahkan base:
      ```css
      body {
        display: flex;
        justify-content: center;
        margin: 0;
        font-family: system-ui, "Segoe UI", Roboto, sans-serif;
      }
      ```
- [ ] Step 4: Di `web/src/app.css` tambahkan rule baru setelah `#app`:
      ```css
      .invite :is(h1, h2, h3) {
        font-family: var(--font-display);
        font-weight: 300;
      }
      .invite p {
        font-family: var(--font-display);
      }
      ```
- [ ] Step 5: Di `web/src/App.svelte` bungkus cabang undangan: setelah `<div class="phone">` tempat `{:else}` (baris 166) tambah `<div class="invite">`, dan tutup sebelum `<footer class="admin-link">` (baris 241). Markup: baris 167 `{#if !opened}` sampai 240 tetap di dalam, baris 239 `<footer class="admin-link">` tetap di luar invite.
- [ ] Step 6: Run `npm run build` di `C:\Users\ubdd\_code\weddubdsow\web`.
- [ ] Step 7: Run `npx jig-ui check` di repo root.
- [ ] Step 8: Commit `feat: quiet luxury typography foundation`.

### Task 2: Cover, hero, countdown, fab → verify: build (web) exit 0; agent-browser computed `.hero h1` fontFamily mengandung `Cormorant Garamond`; computed `.cell` backgroundColor `rgba(0, 0, 0, 0)`; computed `.cover` borderColor sama dengan `--color-accent-gold-weak`.

**Files:**
- Modify: `web/src/App.svelte:245-521`
- Modify: `web/src/lib/sprites.css:41-51`

- [ ] Step 1: Cover: ubah `.cover` (baris 251-262) padding jadi `var(--spacing-xl)`, tambahkan `border: 1px solid var(--color-accent-gold-weak)`.
- [ ] Step 2: Envelope editorial: `.envelope` (279-286) hapus `background: var(--color-bg-raised)` dan `border`, ganti jadi `border: 1px solid var(--color-stroke-weak)`; `.env-body` (297-304) hapus border, tambahkan inner hairline lewat `box-shadow: inset 0 0 0 1px var(--color-accent-gold-weak)`. `.env-seal` (306-321) jadi emas dengan teks `--color-bg-base` dan `font-family: var(--font-display)` italic.
- [ ] Step 3: Eyebrow (271-277): `color: var(--color-accent-gold)`.
- [ ] Step 4: Hero h1 (368-379): `font-weight: 300` dan `letter-spacing: var(--tracking-h1)`; `.name` (381-384): `font-family: var(--font-display)`; `.amp` (386-389): tetap gold, `font-family: var(--font-display)`, italic.
- [ ] Step 5: Countdown cells (409-434): `.cell` hapus `background` dan `border-radius`, ganti `border: 0`, tambah `border-top: 1px solid var(--color-accent-gold-weak)`; `strong` tetap tabular.
- [ ] Step 6: Fab (453-466): jadi pill glass: `background: var(--color-bg-base)`, `border: 1px solid var(--color-accent-gold-weak)`, `box-shadow: none`, `backdrop-filter: blur(8px)`.
- [ ] Step 7: Reveal lebih tenang: `web/src/lib/sprites.css:41-51` ubah `translateY(14px)` jadi `translateY(12px)`, transition `0.8s`.
- [ ] Step 8: Run `npm run build` di web.
- [ ] Step 9: Jalankan dev server (`npx wrangler dev --port 8787` di api, sudah berjalan) lalu agent-browser ke `http://localhost:8787`, eval computed styles: fontFamily h1, backgroundColor `.cell`, borderColor `.cover`.
- [ ] Step 10: Commit `feat: quiet luxury cover and hero`.

### Task 3: Chrome section via SectionHeading → verify: build (web) exit 0; agent-browser `document.querySelectorAll(".numeral").length` bernilai 5.

**Files:**
- Create: `web/src/lib/SectionHeading.svelte`
- Modify: `web/src/lib/SectionCouple.svelte:6-11, 26-42`
- Modify: `web/src/lib/SectionStory.svelte:6-7, 29-43`
- Modify: `web/src/lib/SectionSchedule.svelte:6-7, 34-48`
- Modify: `web/src/lib/SectionGallery.svelte:19-20, 48-62`
- Modify: `web/src/lib/SectionClosing.svelte:6-7, 23-37`

- [ ] Step 1: Buat `web/src/lib/SectionHeading.svelte`:
      ```svelte
      <script lang="ts">
        let { eyebrow, title, numeral }: { eyebrow: string; title: string; numeral: string } = $props();
      </script>

      <div class="head">
        <span class="eyebrow" aria-hidden="true">{eyebrow}</span>
        <span class="numeral" aria-hidden="true">{numeral}</span>
        <h2>{title}</h2>
        <span class="rule" aria-hidden="true"></span>
      </div>

      <style>
        .head {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xs);
        }
        .eyebrow {
          font-size: var(--text-caption);
          font-weight: var(--font-weight-bold);
          letter-spacing: var(--tracking-caps);
          text-transform: uppercase;
          color: var(--color-accent-gold);
          margin: 0;
        }
        .numeral {
          position: absolute;
          right: 0;
          top: 0;
          font-family: var(--font-display);
          font-weight: 300;
          font-style: italic;
          font-size: var(--text-h1);
          line-height: 1;
          color: var(--color-accent-gold-weak);
        }
        .head {
          position: relative;
        }
        .head h2 {
          font-size: var(--text-h2);
          line-height: var(--leading-h2);
          color: var(--color-text-strong);
          margin: 0;
          padding-top: var(--spacing-2xs);
        }
        .rule {
          margin-top: var(--spacing-s);
          border-top: 1px solid var(--color-accent-gold-weak);
        }
      </style>
      ```
- [ ] Step 2: Di setiap section, ganti blok `<p class="eyebrow">..</p>` + `<h2>..</h2>` dengan `<SectionHeading eyebrow="..." title="..." numeral="NN" />`. Nomor urut: Couple `01`, Story `02`, Schedule `03`, Gallery `04`, Closing `05`. Import `SectionHeading` di tiap file. Hapus style `.eyebrow` dan `h2` milik tiap section.
- [ ] Step 3: Couple: heading baris 6-11 diganti; hapus style `.eyebrow` (26-33) dan `.couple-heading` tetap (nama besar pakai font display dari app.css).
- [ ] Step 4: Story: baris 6-7 diganti SectionHeading+numeral 02. Story `.step h3` font-weight 300.
- [ ] Step 5: Schedule: baris 6-7 diganti, numeral 03.
- [ ] Step 6: Gallery: baris 19-20 diganti, numeral 04.
- [ ] Step 7: Closing: baris 6-7 diganti, numeral 05.
- [ ] Step 8: Run `npm run build` di web.
- [ ] Step 9: agent-browser ke `http://localhost:8787`, eval `document.querySelectorAll(".numeral").length`.
- [ ] Step 10: Commit `feat: section heading chrome`.

### Task 4: Schedule editorial, gallery polaroid, closing italic → verify: build (web) exit 0; agent-browser computed `.card` backgroundColor `rgba(0, 0, 0, 0)`; computed `.thumb img` borderColor `var(--color-accent-gold-weak)`.

**Files:**
- Modify: `web/src/lib/SectionSchedule.svelte:50-91`
- Modify: `web/src/lib/SectionGallery.svelte:71-101`
- Modify: `web/src/lib/SectionClosing.svelte:39-59`

- [ ] Step 1: Schedule: `.cards` (50-57) ganti gap jadi `var(--spacing-l)` dan hapus border. `.card` (59-67) hapus `padding`, `border-radius`, `border`, `background`; tambah `border-bottom: 1px solid var(--color-stroke-weak)`. `.time` (85-91) ukuran `var(--text-lead)`, weight 300, `font-family: var(--font-display)`.
- [ ] Step 2: Gallery: `.thumb` (80-88) hapus border-radius, tambah `border: 1px solid var(--color-accent-gold-weak)`; `.thumb img` (90-96) hapus border-radius, `padding: var(--spacing-2xs)` supaya frame tipis; `.grid` (71-78) gap `var(--spacing-s)`.
- [ ] Step 3: Closing: `.prose` (39-45) tetap; `.couple` (53-59) `font-family: var(--font-display)`, italic, `font-weight: 300`, size `var(--text-h2)`.
- [ ] Step 4: Run `npm run build` di web.
- [ ] Step 5: agent-browser ke `http://localhost:8787/#/section-gallery` relatif: eval computed backgroundColor `.card` dan borderColor `.thumb img`.
- [ ] Step 6: Commit `feat: editorial schedule gallery closing`.

### Task 5: RSVP dan guest book panel hairline → verify: build (web) exit 0; agent-browser post pesan di `#messages` dengan nama unik muncul di `ul.feed` setelah submit.

**Files:**
- Modify: `web/src/lib/SectionMessages.svelte:176-258`
- Modify: `web/src/lib/SectionRsvp.svelte:183-304`

- [ ] Step 1: Messages: `.compose` (176-184) hapus `background` dan `border-radius`, ganti `border: 1px solid var(--color-accent-gold-weak)`; `.msg` (308-316) hapus `background` dan `border-radius`, ganti `border: 1px solid var(--color-stroke-weak)`; `.heart span` (357-359) tetap gold.
- [ ] Step 2: Rsvp: `.summary` dan `.field input/select` (227-252) hapus `background: var(--color-bg-raised)` dan ganti border jadi `var(--color-stroke-weak)`; form tetap gap `var(--spacing-m)`.
- [ ] Step 3: Run `npm run build` di web.
- [ ] Step 4: agent-browser: isi `#msg-name` dan `#msg-text`, submit, pastikan nama yang dipakai muncul di `ul.feed` (regresi fungsional).
- [ ] Step 5: Commit `feat: hairline panels for rsvp and guest book`.

### Task 6: Regresi akhir dan deploy → verify: `Invoke-WebRequest` prod `https://api.ubdaw.workers.dev` status `200`; body mengandung `Undangan`.

**Files:**
- Modify: none (verifikasi + git)

- [ ] Step 1: Run `npm run build` di web dan `npm test` di `C:\Users\ubdd\_code\weddubdsow\api` (regresi API, exit 0).
- [ ] Step 2: agent-browser ke `http://localhost:8787/#/admin`: form login tetap tampil, dan routa `#/admin` tidak menampilkan undangan (regresi admin).
- [ ] Step 3: `git push origin main` dari `C:\Users\ubdd\_code\weddubdsow` (CI auto deploy).
- [ ] Step 4: Tunggu workflow selesai, `Invoke-WebRequest -Uri https://api.ubdaw.workers.dev` lalu cek status.
- [ ] Step 5: Commit sisa apa pun yang belum, push.