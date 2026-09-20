# Manual device checklist

Invitation live at https://api.ubdaw.workers.dev. Check each item on a real phone. Record pass or fail next to each.

## Invitation

- [ ] Cover envelope opens on tap, gold wax seal "U & S" shows.
- [ ] Cover state persists after reload (opens straight to hero).
- [ ] Countdown counts to 8 Oktober 2026 pukul 09.00 WIB.
- [ ] Music toggle (bottom-right) starts and stops the song.
- [ ] WhatsApp share button opens a pre-filled message.
- [ ] Sections reveal with fade on scroll.
- [ ] Gallery thumbnail opens the full photo in a lightbox, closes with Tutup.
- [ ] Pinned screen: petals and the sprite animation run; with reduced motion enabled they are hidden.

## RSVP

- [ ] Empty name shows a field error.
- [ ] Attendance with one of Ya / Tidak / Mungkin and guest count saves, shows success summary.
- [ ] Invalid guest count (0 or 6+) is rejected.

## Guest book

- [ ] Message posts and appears in the list.
- [ ] Post persists after a reload (stored in Neon).
- [ ] Heart click on a message increments the count without a reload.

## Admin

- [ ] https://api.ubdaw.workers.dev/#/admin with a wrong password shows "Kata sandi salah".
- [ ] Right password shows the guest book and RSVP lists.
- [ ] Delete on a message removes it from the list and from the public page.
- [ ] Logout returns to the login form.