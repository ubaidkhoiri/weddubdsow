<script lang="ts">
	import { onMount } from "svelte";
	import "@lottiefiles/dotlottie-wc";
	const ringsUrl = "/rings.lottie";
	const prefersReduced =
		typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	import "./lib/sprites.css";
	import { event, couple, inviteMessage } from "./lib/content";
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
	let closing = $state(false);
	let now = $state(Date.now());
	let isAdmin = $state(false);

	$effect(() => {
		if (typeof document === "undefined") return;
		document.body.classList.toggle("is-locked", !opened);
	});

	onMount(() => {
		const syncHash = () => (isAdmin = location.hash === "#/admin");
		syncHash();
		window.addEventListener("hashchange", syncHash);
		return () => window.removeEventListener("hashchange", syncHash);
	});

	$effect(() => {
		const timer = setInterval(() => (now = Date.now()), 1000 - (Date.now() % 1000));
		return () => clearInterval(timer);
	});

	const remaining = $derived(Math.max(0, target - now));
	const days = $derived(Math.floor(remaining / 86_400_000));
	const hours = $derived(Math.floor((remaining % 86_400_000) / 3_600_000));
	const minutes = $derived(Math.floor((remaining % 3_600_000) / 60_000));
	const seconds = $derived(Math.floor((remaining % 60_000) / 1000));

	onMount(() => {
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

		ensureYtPlayer();
	});

	function openInvite() {
		if (closing) return;
		if (prefersReduced) {
			opened = true;
		} else {
			closing = true;
			window.setTimeout(() => {
				opened = true;
			}, 750);
		}
		musicOn = true;
		applyMusic(true);
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
		<button
			class="cover"
			class:closing
			type="button"
			onclick={openInvite}
			aria-label="Buka undangan"
		>
			<span class="cover-inner">
				<span class="eyebrow">Undangan Ngunduh Mantu</span>
				<span class="cover-names" aria-label={`${event.groom} dan ${event.bride}`}>
					<span class="name">{event.groom}</span>
					<span class="amp">&amp;</span>
					<span class="name">{event.bride}</span>
				</span>
				<span class="greeting">{inviteMessage}</span>
				<span class="rings" aria-hidden="true">
					<dotlottie-wc src={ringsUrl} autoplay={!prefersReduced} loop></dotlottie-wc>
				</span>
				<span class="tap-hint">Ketuk untuk membuka</span>
			</span>
		</button>
	{/if}

	<header class="hero" aria-label={event.title}>
		<div class="card hero-title">
			<p class="eyebrow">Undangan Ngunduh Mantu</p>
			<h1>
				<span class="name">{event.groom}</span>
				<span class="amp">&amp;</span>
				<span class="name">{event.bride}</span>
			</h1>
			<p class="date-line">{event.dateStart} - {event.dateEnd}</p>
			<p class="venue">{event.venue}</p>
		</div>

		<div class="row">
			<div class="card countdown" role="timer" aria-label="Hitung mundur menuju acara utama">
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
			<div class="card hero-meta">
				<span class="crescent" aria-hidden="true">
					<svg
						viewBox="0 0 40 40"
						width="32"
						height="32"
						fill="none"
						stroke="var(--color-accent)"
						stroke-width="2"
						stroke-linecap="round"
					>
						<path d="M27 7a15 15 0 1 0 6 19 12.5 12.5 0 0 1-6-19Z" />
					</svg>
				</span>
				<p class="meta-label">Ngunduh Mantu</p>
				<p class="meta-value">{event.mainDay}</p>
				<p class="meta-sub">Pukul {event.mainTime} WIB</p>
			</div>
		</div>
	</header>

	<div data-reveal><SectionCouple /></div>
	<div data-reveal><SectionStory /></div>
	<div data-reveal><SectionSchedule /></div>
	<div data-reveal><SectionGallery /></div>
	<div data-reveal><SectionRsvp /></div>
	<div data-reveal><SectionMessages /></div>
	<div data-reveal><SectionClosing /></div>

	<div id="yt-player" class="player" aria-hidden="true" tabindex="-1"></div>

	<div class="fab-layer">
		<button class="fab music" type="button" onclick={toggleMusic} aria-pressed={musicOn}>
			{musicOn ? "Hentikan musik" : "Putar musik"}
		</button>
		<a
			class="fab share"
			href="https://wa.me/?text={encodeURIComponent(shareText())}"
			target="_blank"
			rel="noreferrer"
		>Bagikan lewat WhatsApp</a>
	</div>

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

	.invite {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
		padding: var(--spacing-m) var(--spacing-s) 140px;
		min-height: 100svh;
	}

	.card {
		background: var(--color-bg-raised);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-surface);
		padding: var(--spacing-m);
	}

	.cover {
		position: fixed;
		inset: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-l);
		background: var(--color-bg-base);
		border: 0;
		cursor: pointer;
	}

	.cover::before {
		content: "";
		position: absolute;
		inset: 0;
		margin: 0 auto;
		width: 100%;
		max-width: 393px;
		border-inline: var(--border-width-hairline) solid var(--color-stroke-weak);
		pointer-events: none;
	}

	.cover-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-m);
		max-width: 340px;
		width: 100%;
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
		padding: var(--spacing-xl) var(--spacing-m);
	}

	.cover-names {
		display: flex;
		align-items: baseline;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--spacing-s);
		margin: 0;
		font-size: var(--text-h1);
		line-height: var(--leading-h1);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-h1);
		color: var(--color-text-strong);
	}

	.cover-names .amp {
		color: var(--color-accent);
		font-size: var(--text-h2);
	}

	.greeting {
		max-width: 28ch;
		margin-inline: auto;
		text-align: center;
		font-size: var(--text-body);
		line-height: 1.5;
		color: var(--color-text-weak);
	}

	.eyebrow {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-brand);
		margin: 0;
	}

	.rings {
		width: 200px;
		height: 200px;
		color: var(--color-text-strong);
	}

	.rings dotlottie-wc {
		width: 100%;
		height: 100%;
		overflow: hidden;
		filter: invert(1);
	}

	.cover:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: -4px;
	}

	.cover.closing {
		pointer-events: none;
		animation: cover-out 700ms var(--ease-out) forwards;
	}

	@media (prefers-reduced-motion: no-preference) {
		.cover-inner > * {
			animation: cover-in var(--duration-slow) var(--ease-out) both;
		}

		.cover-inner > *:nth-child(1) {
			animation-delay: 100ms;
		}

		.cover-inner > *:nth-child(2) {
			animation-delay: 200ms;
		}

		.cover-inner > *:nth-child(3) {
			animation-delay: 300ms;
		}

		.cover-inner > *:nth-child(4) {
			animation-delay: 400ms;
		}

		.cover-inner > *:nth-child(5) {
			animation-delay: 500ms;
		}

		.cover-inner > *:nth-child(6) {
			animation-delay: 600ms;
		}

		@keyframes cover-in {
			from {
				opacity: 0;
				transform: translateY(var(--spacing-s));
			}
			to {
				opacity: 1;
				transform: none;
			}
		}

		@keyframes cover-out {
			to {
				opacity: 0;
				visibility: hidden;
			}
		}
	}

	.tap-hint {
		display: inline-flex;
		align-items: center;
		min-height: var(--size-touch-target);
		padding: var(--spacing-s) var(--spacing-l);
		border-radius: var(--radius-full);
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		color: var(--color-on-cta);
		background: var(--color-cta);
	}

	.hero {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.hero-title {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-s);
		text-align: center;
	}

	.hero-title h1 {
		display: flex;
		align-items: baseline;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--spacing-s);
		font-size: var(--text-h1);
		line-height: var(--leading-h1);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-h1);
		color: var(--color-text-strong);
		margin: 0;
	}

	.name {
		font-family: var(--font-display);
		font-size: var(--text-h1);
		line-height: 1.15;
	}

	.amp {
		color: var(--color-accent);
		font-family: var(--font-display);
		font-size: var(--text-h2);
		line-height: 1;
	}

	.date-line {
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-brand);
		margin: 0;
	}

	.venue {
		font-size: var(--text-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	.row {
		display: flex;
		gap: var(--spacing-s);
	}

	.row .card {
		flex: 1;
		min-width: 0;
	}

	.countdown {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-2xs);
	}

	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2xs);
		padding: var(--spacing-s);
		border-radius: var(--radius-control);
		background: var(--color-fill);
	}

	.cell strong {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
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

	.hero-meta {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2xs);
		text-align: center;
	}

	.crescent {
		color: var(--color-accent);
		margin-bottom: var(--spacing-2xs);
	}

	.meta-label {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-caps);
		color: var(--color-text-weak);
		margin: 0;
	}

	.meta-value {
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-strong);
		margin: 0;
	}

	.meta-sub {
		font-size: var(--text-caption);
		color: var(--color-text-weak);
		margin: 0;
	}

	.player {
		position: fixed;
		inset: auto 50% -9999px auto;
		width: 1px;
		height: 1px;
		border: 0;
	}

	.fab-layer {
		position: fixed;
		inset: 0 auto 0 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 393px;
		z-index: 10;
		pointer-events: none;
	}

	.fab {
		position: absolute;
		bottom: var(--spacing-s);
		min-height: var(--size-touch-target);
		padding: var(--spacing-s) var(--spacing-m);
		border-radius: var(--radius-full);
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		text-decoration: none;
		background: var(--color-bg-raised);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		color: var(--color-text-strong);
		box-shadow: none;
		cursor: pointer;
		pointer-events: auto;
	}

	.fab:hover {
		background: var(--color-fill);
	}

	.fab:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.music {
		left: var(--spacing-s);
	}

	.share {
		right: var(--spacing-s);
	}

	.admin-link {
		padding: var(--spacing-s) 0 0;
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
</style>