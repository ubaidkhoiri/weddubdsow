<script lang="ts">
	import { event } from "../lib/content";
</script>

<main class="v2-soon">
	<p class="v2-kicker">Undangan Pernikahan</p>
	<h1 class="v2-names">{event.bride} &amp; {event.groom}</h1>
	<p class="v2-date">{event.mainDay} &middot; {event.mainTime} &middot; {event.venue}</p>
	<p class="v2-note">Tampilan baru sedang disiapkan. RSVP dan ucapan tetap bisa dipakai seperti biasa.</p>
	<p class="v2-note"><a href="/?v=v1">Lihat tampilan lama</a></p>
</main>

<style>
	.v2-soon {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 2rem 1.5rem;
		text-align: center;
		background: #faf8f4;
		color: #2b2620;
		font-family: "DM Sans", system-ui, sans-serif;
	}
	.v2-kicker {
		letter-spacing: 0.2em;
		text-transform: uppercase;
		font-size: 0.75rem;
		opacity: 0.7;
	}
	.v2-names {
		font-size: 2rem;
		line-height: 1.2;
		margin: 0;
	}
	.v2-date {
		opacity: 0.8;
	}
	.v2-note {
		max-width: 24rem;
		opacity: 0.8;
	}
</style>
