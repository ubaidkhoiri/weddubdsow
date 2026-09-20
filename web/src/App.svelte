<script lang="ts">
	import { onMount } from "svelte";
	import "./lib/sprites.css";
	import { event } from "./lib/content";
	import Admin from "./routes/admin.svelte";
	import SectionCouple from "./lib/SectionCouple.svelte";
	import SectionStory from "./lib/SectionStory.svelte";
	import SectionSchedule from "./lib/SectionSchedule.svelte";
	import SectionGallery from "./lib/SectionGallery.svelte";
	import SectionRsvp from "./lib/SectionRsvp.svelte";
	import SectionMessages from "./lib/SectionMessages.svelte";
	import SectionClosing from "./lib/SectionClosing.svelte";

	const target = new Date("2026-10-08T09:00:00+07:00").getTime();
	let opened = $state(false);
	let now = $state(Date.now());
	let isAdmin = $state(false);

	onMount(() => {
		const syncHash = () => (isAdmin = location.hash === "#/admin");
		syncHash();
		window.addEventListener("hashchange", syncHash);
		return () => window.removeEventListener("hashchange", syncHash);
	});

	$effect(() => {
		const timer = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(timer);
	});

	const remaining = $derived(Math.max(0, target - now));
	const days = $derived(Math.floor(remaining / 86_400_000));
	const hours = $derived(Math.floor((remaining % 86_400_000) / 3_600_000));
	const minutes = $derived(Math.floor((remaining % 3_600_000) / 60_000));
	const seconds = $derived(Math.floor((remaining % 60_000) / 1000));

	onMount(() => {
		try {
			if (localStorage.getItem("weddu-opened") === "1") {
				opened = true;
			}
		} catch {
			/* localStorage unavailable, cover stays */
		}

		const revealObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-inview");
						revealObserver.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.15 }
		);
		for (const el of document.querySelectorAll("[data-reveal]")) {
			revealObserver.observe(el);
		}

		const spriteObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					entry.target.classList.toggle("is-active", entry.isIntersecting);
				}
			},
			{ threshold: 0.4 }
		);
		for (const el of document.querySelectorAll(".petal-sprite--hero, .petal-sprite--divider")) {
			spriteObserver.observe(el);
		}

		ensureYtPlayer();
	});

	function openInvite() {
		opened = true;
		musicOn = true;
		applyMusic(true);
		try {
			localStorage.setItem("weddu-opened", "1");
		} catch {
			/* ignore */
		}
	}

	function pad(value: number): string {
		return String(value).padStart(2, "0");
	}

	function shareText(): string {
		return `Undangan Ngunduh Mantu ${event.groom} & ${event.bride}, ${event.dateStart} sampai ${event.dateEnd} di ${event.venue}.`;
	}

	let musicOn = $state(false);
	let ytPlayer: unknown = null;
	let ytReady = false;
	let ytStarted = false;

	function applyMusic(restart = false) {
		const p = ytPlayer as any;
		if (!p || !ytReady) return;
		if (musicOn) {
			ytStarted = true;
			if (restart) p.seekTo(0, true);
			p.unMute();
			p.setVolume(100);
			p.playVideo();
		} else if (ytStarted) {
			p.pauseVideo();
		}
	}

	function buildYtPlayer() {
		const w = window as any;
		ytPlayer = new w.YT.Player("yt-player", {
			videoId: "1892ujwIooo",
			playerVars: {
				autoplay: 1,
				mute: 1,
				loop: 1,
				playlist: "1892ujwIooo",
				playsinline: 1,
				controls: 0,
				rel: 0,
			},
			events: {
				onReady: (e: any) => {
					ytReady = true;
					e.target.setVolume(100);
					applyMusic();
				},
				onStateChange: (e: any) => {
					if (e.data === w.YT.PlayerState.ENDED) musicOn = false;
				},
			},
		});
	}

	function ensureYtPlayer() {
		const w = window as any;
		if (w.YT && w.YT.Player) {
			buildYtPlayer();
			return;
		}
		w.onYouTubeIframeAPIReady = buildYtPlayer;
		if (!w.__wedduYtLoaded) {
			w.__wedduYtLoaded = true;
			const s = document.createElement("script");
			s.src = "https://www.youtube.com/iframe_api";
			s.async = true;
			document.head.appendChild(s);
		}
	}

	function toggleMusic() {
		musicOn = !musicOn;
		if (ytPlayer) applyMusic();
		else ensureYtPlayer();
	}
</script>

<div class="phone">
	{#if isAdmin}
		<Admin />
	{:else}
	<div class="invite">
	{#if !opened}
		<button class="cover" type="button" onclick={openInvite} aria-label="Buka undangan">
			<span class="cover-inner">
				<span class="eyebrow">Undangan Ngunduh Mantu</span>
				<span class="envelope" aria-hidden="true">
					<span class="env-flap"></span>
					<span class="env-body"></span>
					<span class="env-seal">U &amp; S</span>
					<span class="env-letter"></span>
				</span>
				<span class="tap-hint">Ketuk untuk membuka</span>
			</span>
		</button>
	{/if}

	<header class="hero" class:dim={!opened} aria-label={event.title}>
		<p class="eyebrow">Undangan Ngunduh Mantu</p>
		<h1>
			<span class="name">{event.groom}</span>
			<span class="amp">&amp;</span>
			<span class="name">{event.bride}</span>
		</h1>
		<p class="date-line">{event.dateStart} - {event.dateEnd}</p>
		<p class="venue">{event.venue}</p>

		<div class="countdown" role="timer" aria-label="Hitung mundur menuju acara utama">
			{#each [
				{ label: "Hari", value: days },
				{ label: "Jam", value: hours },
				{ label: "Menit", value: minutes },
				{ label: "Detik", value: seconds },
			] as cell (cell.label)}
				<span class="cell">
					<strong>{pad(cell.value)}</strong>
					<small>{cell.label}</small>
				</span>
			{/each}
		</div>

		<div class="petals" aria-hidden="true">
			<span class="petal"></span>
			<span class="petal"></span>
			<span class="petal"></span>
			<span class="petal"></span>
			<span class="petal"></span>
		</div>
		<span class="petal-sprite petal-sprite--hero" aria-hidden="true"></span>
		<span class="scroll-hint" aria-hidden="true"></span>
	</header>

	<div data-reveal><SectionCouple /></div>
	<div data-reveal><SectionStory /></div>
	<div data-reveal><SectionSchedule /></div>
	<div data-reveal><SectionGallery /></div>
	<div data-reveal><SectionRsvp /></div>
	<div data-reveal><SectionMessages /></div>
	<div data-reveal><SectionClosing /></div>

	<div class="petal-sprite petal-sprite--divider" aria-hidden="true"></div>

	<div id="yt-player" class="player" aria-hidden="true" tabindex="-1"></div>

	<button class="fab music" type="button" onclick={toggleMusic} aria-pressed={musicOn}>
		{musicOn ? "Hentikan musik" : "Putar musik"}
	</button>
	<a
		class="fab share"
		href="https://wa.me/?text={encodeURIComponent(shareText())}"
		target="_blank"
		rel="noreferrer"
	>Bagikan lewat WhatsApp</a>

	<footer class="admin-link">
		<a href="#/admin">Admin</a>
	</footer>
	</div>
	{/if}
</div>

<style>
	.phone {
		display: flex;
		flex-direction: column;
	}

	.cover {
		position: fixed;
		inset: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-card);
		background: var(--color-bg-base);
		border: 0;
		cursor: pointer;
	}

	.cover-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-l);
	}

	.eyebrow {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-weak);
	}

	.envelope {
		position: relative;
		width: 240px;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
		border: 1px solid var(--color-stroke-weak);
	}

	.env-flap {
		position: absolute;
		inset: 0;
		background: var(--color-fill-brand);
		clip-path: polygon(0 0, 100% 0, 50% 62%);
		transition: transform var(--duration-slow) var(--ease-in-out);
		transform-origin: top center;
	}

	.env-body {
		position: absolute;
		inset: 0;
		background: var(--color-bg-raised);
		border-radius: var(--radius-surface);
		clip-path: polygon(0 100%, 50% 45%, 100% 100%);
		border: 1px solid var(--color-stroke-weak);
	}

	.env-seal {
		position: absolute;
		left: 50%;
		top: 42%;
		transform: translate(-50%, -50%);
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-full);
		background: var(--color-accent-gold);
		color: var(--color-text-strong);
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.04em;
	}

	.env-letter {
		position: absolute;
		left: 12%;
		right: 12%;
		bottom: 10%;
		top: 22%;
		background: var(--color-bg-base);
		border: 1px solid var(--color-stroke-weak);
		border-radius: var(--radius-sm);
		transform: translateY(6px);
	}

	.cover:hover .env-flap,
	.cover:focus-visible .env-flap {
		transform: rotateX(35deg);
	}

	.cover:active .env-flap {
		transform: rotateX(75deg);
	}

	.cover:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: -4px;
	}

	.tap-hint {
		font-size: var(--text-body);
		color: var(--color-text-weak);
	}

	.hero {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-s);
		padding: var(--spacing-xxl) var(--spacing-m) var(--spacing-section);
		text-align: center;
	}

	.petal-sprite--divider {
		margin: 0 auto var(--spacing-section);
	}

	.hero h1 {
		display: flex;
		align-items: baseline;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--spacing-s);
		font-size: var(--text-h1);
		line-height: var(--leading-h1);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-strong);
		margin: 0;
	}

	.name {
		font-family: var(--font-display);
		font-size: var(--text-h1);
		line-height: 1.15;
	}

	.amp {
		color: var(--color-accent-gold);
		font-size: var(--text-h3);
	}

	.date-line {
		font-size: var(--text-body);
		color: var(--color-text-strong);
		margin: 0;
	}

	.venue {
		font-size: var(--text-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	.countdown {
		display: flex;
		gap: var(--spacing-s);
		margin-top: var(--spacing-m);
	}

	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-2xs);
		min-width: 64px;
		padding: var(--spacing-s);
		border-radius: var(--radius-surface);
		border: 1px solid var(--color-stroke-weak);
		background: var(--color-bg-raised);
	}

	.cell strong {
		font-size: var(--text-h2);
		line-height: var(--leading-h2);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-strong);
		font-variant-numeric: tabular-nums;
	}

	.cell small {
		font-size: var(--text-caption);
		color: var(--color-text-weak);
		text-transform: uppercase;
		letter-spacing: var(--tracking-caps);
	}

	.scroll-hint {
		width: 18px;
		height: 18px;
		margin-top: var(--spacing-m);
		border-right: 2px solid var(--color-accent-gold-weak);
		border-bottom: 2px solid var(--color-accent-gold-weak);
		transform: rotate(45deg);
	}

	.player {
		position: fixed;
		inset: auto 50% -9999px auto;
		width: 1px;
		height: 1px;
		border: 0;
	}

	.fab {
		position: fixed;
		bottom: var(--spacing-m);
		z-index: 10;
		min-height: var(--size-touch-target);
		padding: var(--spacing-s) var(--spacing-m);
		border-radius: var(--radius-full);
		font-size: var(--text-body);
		text-decoration: none;
		background: var(--color-bg-raised);
		border: 1px solid var(--color-stroke-strong);
		color: var(--color-text-strong);
		box-shadow: var(--shadow-raised);
	}

	.fab:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.music {
		left: var(--spacing-m);
	}

	.share {
		right: var(--spacing-m);
	}

	.admin-link {
		padding: var(--spacing-l) 0 var(--spacing-section);
		text-align: center;
		font-size: var(--text-caption);
	}

	.admin-link a {
		color: var(--color-text-weak);
		text-decoration: none;
	}

	.admin-link a:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	@media (min-width: 431px) {
		.cover {
			border-inline: 1px solid var(--color-stroke-weak);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.scroll-hint {
			animation: bob var(--duration-ambient-base) var(--ease-in-out) infinite alternate;
		}

		.cover:hover {
			transition: transform var(--duration-base) var(--ease-out);
		}

		@keyframes bob {
			from {
				transform: rotate(45deg) translateY(0);
			}
			to {
				transform: rotate(45deg) translateY(6px);
			}
		}
	}
</style>