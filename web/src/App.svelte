<script lang="ts">
	import { onMount } from "svelte";
	import "@lottiefiles/dotlottie-wc";
	const ringsUrl = "/rings.lottie";
	const prefersReduced =
		typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	import "./lib/sprites.css";
	import { event } from "./lib/content";

	const groomParent = { father: "Amin", mother: "Dwi Suprihatin R" };
	const brideParent = { father: "Agung Pitana", mother: "Karmini" };
	const inviteDates = "7-8 November 2026";
	const inviteHours = "09.00 - 14.00";
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
	let phase = $state(prefersReduced ? "cover" : "intro");
	let now = $state(Date.now());
	let isAdmin = $state(false);

	$effect(() => {
		if (typeof document === "undefined") return;
		document.body.classList.toggle("is-locked", !opened);
		document.body.classList.toggle("is-bg", pageBgReady);
	});

	let introTimer: ReturnType<typeof setTimeout> | null = null;
	let bgReady = $state(false);
	let pageBgReady = $state(false);

	onMount(() => {
		if (phase !== "intro") return;
		introTimer = setTimeout(() => (phase = "cover"), 4200);
		return () => {
			if (introTimer) clearTimeout(introTimer);
		};
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
		const root = document.documentElement;
		const preload = new Image();
		preload.onload = () => {
			root.classList.add("bg-webp");
			bgReady = true;
		};
		preload.onerror = () => {
			const fallback = new Image();
			fallback.onload = () => {
				root.classList.add("bg-jpg");
				bgReady = true;
			};
			fallback.onerror = () => {
				root.classList.add("bg-jpg");
				bgReady = true;
			};
			fallback.src = "/bgcover.jpg";
		};
		preload.src = "/bgcover.webp";

		const preloadPage = new Image();
		preloadPage.onload = () => (pageBgReady = true);
		preloadPage.onerror = () => {
			const fallbackPage = new Image();
			fallbackPage.onload = () => (pageBgReady = true);
			fallbackPage.onerror = () => (pageBgReady = true);
			fallbackPage.src = "/bg01.jpg";
		};
		preloadPage.src = "/bg01.webp";

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
	let ytStarted = $state(false);

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
			videoId: "-Y9VtoPvtuM",
			playerVars: {
				autoplay: 1,
				mute: 1,
				loop: 1,
				playlist: "-Y9VtoPvtuM",
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
			class:pre={phase === "intro"}
			class:bg-ready={bgReady}
			type="button"
			onclick={openInvite}
			aria-label="Buka undangan"
			inert={phase === "intro"}
		>
			<span class="cover-inner">
				<span class="monogram" aria-hidden="true"
					><span class="m-line">{event.groom}</span
					><span class="m-line">{event.bride}</span></span
				>
				<span class="tap-hint"
					><span class="h-word">Ketuk</span>
					<span class="h-word">untuk</span>
					<span class="h-word">membuka</span></span
				>
			</span>
		</button>
		{#if phase === "intro"}
			<div
				class="intro"
				class:bg-ready={bgReady}
				role="status"
				aria-label="Undangan Ngunduh Mantu"
			>
				<span class="rings rings--intro" aria-hidden="true">
					<dotlottie-wc src={ringsUrl} autoplay={!prefersReduced} loop></dotlottie-wc>
				</span>
			</div>
		{/if}
	{/if}

	<header class="hero" aria-label={event.title}>
		<div class="mono-stage">
			<span class="page-mono" aria-hidden="true">
				<span class="m-line">U</span>
				<span class="m-line">S</span>
			</span>
			<p class="page-names">{event.groom}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{event.bride}</p>
		</div>

		<div class="invite-copy">
			<p class="ic-arab">ألسلام عليكم ورحمة الله وبركاته</p>
			<p class="ic-prose-lead">
				<em>Maha Suci Allah</em> yang telah menciptakan makhluk-Nya
				<em>berpasang-pasangan</em>. Dengan memohon rahmat dan ridho-Nya, kami bermaksud
				mengundang Bapak/Ibu/Saudara/i dalam acara Syukuran Pernikahan (Ngunduh Mantu)
				putra-putri kami:
			</p>
		</div>

		<div class="invite-copy">
			<div class="ic-couple">
				<p class="ic-name">Ubaid Khoiri</p>
				<p class="ic-parents">
					<span class="ic-amp">Putra dari</span>
					<span class="folks"
						>Bapak <strong>{groomParent.father}</strong> &amp; Ibu
						<strong>{groomParent.mother}</strong></span
					>
				</p>
			</div>
			<p class="ic-amp">dengan</p>
			<div class="ic-couple">
				<p class="ic-name">Almar'atus Sofia T.</p>
				<p class="ic-parents">
					<span class="ic-amp">Putri dari</span>
					<span class="folks"
						>Bapak <strong>{brideParent.father}</strong> &amp; Ibu
						<strong>{brideParent.mother}</strong></span
					>
				</p>
			</div>
		</div>

		<div class="invite-copy">
			<span class="ic-divider" aria-hidden="true"></span>

			<p class="ic-label">Resepsi Ngunduh Mantu</p>
			<p class="ic-dates">{inviteDates}</p>
			<p class="ic-time">{inviteHours}</p>

			<p class="ic-label">Lokasi</p>
			<p class="ic-dates">{event.venue}</p>
			<a class="ic-map" href={event.mapsUrl} target="_blank" rel="noreferrer">Buka di Google Maps</a>

			<p class="ic-prose">
				Ungkapan terima kasih yang tulus dari kami atas kehadiran serta doa restu
				Bapak/Ibu/Saudara/i sekalian. Wassalamu&rsquo;alaikum Warahmatullahi Wabarakatuh.
			</p>

			<p class="ic-signlabel">Kami yang berbahagia,</p>
			<p class="ic-signature">Keluarga Besar Amin</p>
		</div>

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
		{#if ytStarted}
			<div class="now-playing" role="group" aria-label="Pemutar musik">
				<button
					class="np-toggle"
					type="button"
					onclick={toggleMusic}
					aria-pressed={musicOn}
					aria-label={musicOn ? "Jeda musik" : "Putar musik"}
				>
					{#if musicOn}
						<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
							<rect x="4" y="4" width="4" height="12" rx="1" />
							<rect x="12" y="4" width="4" height="12" rx="1" />
						</svg>
					{:else}
						<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
							<path d="M6 4.5v11l9-5.5z" />
						</svg>
					{/if}
				</button>
				<span class="np-meta">
					<strong class="np-title">Honesty</strong>
					<small class="np-artist">Pink Sweat$</small>
				</span>
				<span class="np-marquee" aria-hidden="true">
					<svg viewBox="0 0 20 20" width="16" height="16" fill="none">
						<circle cx="10" cy="10" r="7" />
						<path d="M10 6v4l2.5 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
					</svg>
				</span>
			</div>
		{/if}
		<a
			class="share"
			href="https://wa.me/?text={encodeURIComponent(shareText())}"
			target="_blank"
			rel="noreferrer"
			aria-label="Bagikan undangan lewat WhatsApp"
			title="Bagikan lewat WhatsApp"
		>
			<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
				<path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.94L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.09.89.9-3-.2-.31a8.2 8.2 0 1 1 6.88 3.75Zm4.53-6.14c-.25-.12-1.46-.72-1.68-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.39-1.99-1.23-.73-.66-1.23-1.46-1.38-1.71-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
			</svg>
		</a>
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
		padding: 0 var(--spacing-page-inset) 140px;
		min-height: 100svh;
	}

	.card {
		background: var(--color-bg-glass);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		padding: var(--spacing-m);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.cover {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100vh;
		height: 100lvh;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-l);
		background-color: var(--color-bg-base);
		border: 0;
		cursor: pointer;
	}

	.cover.pre {
		opacity: 0;
		pointer-events: none;
	}

	.cover::after,
	.intro::after {
		content: "";
		position: absolute;
		inset: 0;
		background-image: linear-gradient(var(--color-photo-tint), var(--color-photo-tint));
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		opacity: 0;
		transition: opacity var(--duration-slow) var(--ease-out);
		pointer-events: none;
	}

	:global(html.bg-jpg) .cover::after,
	:global(html.bg-jpg) .intro::after {
		background-image:
			linear-gradient(var(--color-photo-tint), var(--color-photo-tint)),
			url("/bgcover.jpg");
	}

	:global(html.bg-webp) .cover::after,
	:global(html.bg-webp) .intro::after {
		background-image:
			linear-gradient(var(--color-photo-tint), var(--color-photo-tint)),
			url("/bgcover.webp");
	}

	.cover.bg-ready::after,
	.intro.bg-ready::after {
		opacity: 1;
	}

	.intro {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100vh;
		height: 100lvh;
		z-index: 21;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-m);
		padding: var(--spacing-l);
		background-color: var(--color-bg-base);
	}

	.intro::before,
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

	.rings--intro {
		position: relative;
		z-index: 1;
		width: 208px;
		height: 208px;
		color: var(--color-text-strong);
	}

	.rings--intro dotlottie-wc {
		width: 100%;
		height: 100%;
		overflow: hidden;
		filter: invert(1);
		opacity: 0.2;
	}

	@media (prefers-reduced-motion: no-preference) {
		.rings--intro {
			animation:
				intro-ring-in var(--duration-slow) var(--ease-out) both,
				intro-lottie-out 600ms var(--ease-out) 3.4s both;
		}

		@keyframes intro-ring-in {
			from {
				opacity: 0;
				transform: scale(0.9);
			}
			to {
				opacity: 1;
				transform: none;
			}
		}

		@keyframes intro-lottie-out {
			to {
				opacity: 0;
			}
		}
	}

	.cover-inner {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 340px;
		width: 100%;
		min-height: 100svh;
		padding: var(--spacing-xl) var(--spacing-m);
	}

.cover-inner .m-line + .m-line {
		margin-top: calc(-1 * var(--spacing-s));
	}

	.cover-inner .monogram {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: var(--text-monogram);
		line-height: 0.87;
		letter-spacing: 0;
		text-align: center;
		color: var(--color-cover-sign);
		text-shadow:
			0 1px 1px var(--color-cover-shadow),
			1px 2px 2px var(--color-cover-shadow);
	}

	@media (prefers-reduced-motion: no-preference) {
		.cover:not(.pre) .cover-inner .monogram {
			animation: mono-float var(--duration-ambient-slow) var(--ease-in-out) infinite;
		}

		@keyframes mono-float {
			0%,
			100% {
				transform: translateY(0);
			}
			50% {
				transform: translateY(calc(-1 * (var(--spacing-2xs) + var(--spacing-2xs) / 2)));
			}
		}

		.cover:not(.pre) .cover-inner .m-line,
		.cover:not(.pre) .tap-hint .h-word {
			animation: mono-word-in 700ms var(--ease-out) both;
		}

		.cover-inner .m-line:nth-child(1) {
			animation-delay: 800ms;
		}

		.cover-inner .m-line:nth-child(2) {
			animation-delay: 1400ms;
		}

		.tap-hint .h-word:nth-child(1) {
			animation-delay: 2000ms;
		}

		.tap-hint .h-word:nth-child(2) {
			animation-delay: 2400ms;
		}

		.tap-hint .h-word:nth-child(3) {
			animation-delay: 2800ms;
		}

		@keyframes mono-word-in {
			from {
				opacity: 0;
				transform: translateY(var(--spacing-s));
			}
			to {
				opacity: 1;
				transform: none;
			}
		}
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
		@keyframes cover-out {
			to {
				opacity: 0;
				visibility: hidden;
			}
		}
	}

	.tap-hint {
		position: absolute;
		inset-inline: 0;
		bottom: 31.25%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2xs);
		min-height: var(--size-touch-target);
		padding: var(--spacing-2xs) var(--spacing-s);
		font-family: var(--font-text);
		font-size: calc(var(--text-caption) - var(--spacing-2xs));
		font-weight: var(--font-weight-regular);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-weak);
	}

	@media (prefers-reduced-motion: no-preference) {
		.tap-hint {
			animation: hint-blink 3.2s var(--ease-in-out) infinite;
		}

		@keyframes hint-blink {
			0%,
			100% {
				opacity: 0.25;
			}
			50% {
				opacity: 0.6;
			}
		}
	}

	.hero {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.mono-stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 150px 0 var(--spacing-page-bottom);
	}

	.page-mono {
		position: relative;
		z-index: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: var(--text-monogram);
		line-height: var(--spacing-page-mono-line);
		color: var(--color-cover-sign);
		margin: 0;
		padding-inline: var(--spacing-page-mono-edges);
	}

	.page-names {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		padding-inline: var(--spacing-m);
		text-align: center;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-strong);
		white-space: nowrap;
	}

	.page-mono .m-line {
		display: block;
	}

	@media (prefers-reduced-motion: no-preference) {
		.page-mono .m-line:first-child {
			animation: mono-drift 4.7s var(--ease-in-out) infinite;
		}

		.page-mono .m-line:last-child {
			animation: mono-drift 6.3s var(--ease-in-out) -3.1s infinite;
		}

		@keyframes mono-drift {
			0%,
			100% {
				translate: 0 0;
			}
			50% {
				translate: 0 -3px;
			}
		}
	}

	.invite-copy {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--spacing-s);
		padding-block: var(--spacing-s);
		color: var(--color-text-strong);
	}

	.ic-arab {
		margin: 0;
		padding: var(--spacing-2xs) var(--spacing-s);
		font-family: var(--font-text);
		font-size: var(--text-invite-arab);
		line-height: var(--leading-body);
		color: var(--color-text-strong);
		background: var(--color-bg-glass);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-full);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.ic-prose-lead {
		margin: var(--spacing-s) 0 0;
		font-family: var(--font-text);
		font-size: var(--text-invite-arab);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
		text-align: justify;
	}

	.ic-prose-lead em {
		color: var(--color-text-strong);
	}

	.ic-couple {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-2xs);
		padding: 0;
		background: transparent;
		border: 0;
	}

	.ic-name {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
	}

	.ic-parents {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-invite-parents);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
	}

	.ic-parents strong {
		font-weight: var(--font-weight-bold);
		color: var(--color-text-weak);
	}

	.ic-amp {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-size: var(--text-invite-prose);
		color: var(--color-text-brand);
	}

	.invite-copy > .ic-amp {
		margin-block: 20px;
		color: var(--color-text-muted);
	}

	.ic-divider {
		display: block;
		width: 100%;
		height: var(--border-width-hairline);
		background: var(--color-stroke-weak);
		margin-block: var(--spacing-xs);
	}

	.ic-label {
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.ic-dates {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
	}

	.ic-time {
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-caption);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
	}

	.ic-map {
		font-family: var(--font-text);
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-brand);
		text-decoration: underline;
		text-underline-offset: var(--spacing-2xs);
	}

	.ic-map:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: var(--spacing-2xs);
	}

	.ic-prose {
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-invite-prose);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
	}

	.ic-signlabel {
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-invite-prose);
		color: var(--color-text-weak);
	}

	.ic-signature {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
	}

	.page-mono .m-line:first-child {
		transform: translateX(calc(-1 * var(--spacing-page-mono-edges)));
	}

	.page-mono .m-line:last-child {
		transform: translateX(var(--spacing-page-mono-edges));
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
		font-weight: var(--font-weight-regular);
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
		flex-direction: column;
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
		background: var(--color-bg-glass);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
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
		inset: auto 0 0 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 393px;
		z-index: 10;
		padding: 0 var(--spacing-s) var(--spacing-s);
		display: flex;
		flex-direction: column-reverse;
		align-items: flex-end;
		gap: var(--spacing-s);
		pointer-events: none;
	}

	.now-playing {
		display: flex;
		align-items: center;
		gap: var(--spacing-s);
		width: 100%;
		padding: var(--spacing-2xs) var(--spacing-s);
		border-radius: var(--radius-full);
		background: var(--color-text-strong);
		color: var(--color-bg-raised);
		pointer-events: auto;
	}

	.np-toggle {
		display: grid;
		place-items: center;
		width: var(--size-control);
		height: var(--size-control);
		border: 0;
		border-radius: var(--radius-full);
		background: var(--color-bg-raised);
		color: var(--color-text-strong);
		cursor: pointer;
		flex-shrink: 0;
	}

	.np-toggle:focus-visible {
		outline: 2px solid var(--color-bg-raised);
		outline-offset: 2px;
	}

	.np-meta {
		display: flex;
		flex-direction: column;
		gap: 0;
		min-width: 0;
	}

	.np-title {
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		line-height: 1.2;
	}

	.np-artist {
		font-size: var(--text-caption);
		color: var(--color-stroke-weak);
	}

	.np-marquee {
		margin-left: auto;
		opacity: 0.7;
		display: grid;
		place-items: center;
	}

	.share {
		display: grid;
		place-items: center;
		width: var(--size-touch-target);
		height: var(--size-touch-target);
		border-radius: var(--radius-full);
		background: var(--color-bg-raised);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		color: var(--color-text-strong);
		text-decoration: none;
		pointer-events: auto;
	}

	.share:hover {
		background: var(--color-fill);
	}

	.share:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
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