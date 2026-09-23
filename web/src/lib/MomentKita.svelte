<script lang="ts">
	import { onMount } from "svelte";

	const gallery = [
		"Pre-wed • Pagi adem",
		"Pre-wed • Sore senja",
		"Engagement story",
		"Save the Date",
	];

	const story = [
		{
			year: "2019",
			title: "Ketemu di klub baca",
			body: "Di komunitas baca yang sama. Obrolannya pelan-pelan, tapi nyangkut di kepala masing-masing.",
		},
		{
			year: "2021",
			title: "Jadian pelan-pelan",
			body: "Gak ada drama. Cuma yakin, pelan-pelan, kalau ini orangnya.",
		},
		{
			year: "2024",
			title: "Lamaran tertib",
			body: "Rencananya matang, doanya bareng. Kita emang tipe yang suka siapin jalan sebelum jalan.",
		},
		{
			year: "2026",
			title: "Hari Bahagia",
			body: "Hari di mana kita sah jadi satu. Makasih udah mau jadi saksi, ya!",
		},
	];

	let visible = $state(false);
	let active: number | null = $state(null);
	let open = $state(0);
	let paused = $state(false);
	let root: HTMLElement | null = $state(null);

	const photo = (i: number) => `https://picsum.photos/seed/inv-g${i}/520/520?grayscale`;

	onMount(() => {
		if (!root) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					visible = true;
					io.disconnect();
				}
			},
			{ threshold: 0.15 },
		);
		io.observe(root);
		return () => io.disconnect();
	});

	$effect(() => {
		if (paused || open >= story.length - 1) return;
		const t = window.setTimeout(() => (open += 1), 2200);
		return () => window.clearTimeout(t);
	});

	function pick(index: number) {
		paused = true;
		open = index;
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === "Escape") active = null;
	}}
/>

<section
	class="moment"
	class:visible
	bind:this={root}
	aria-label="Momen kita"
>
	<p class="eyebrow">Momen kita</p>
	<div class="moment-grid">
		{#each gallery as caption, i}
			<button
				type="button"
				class="pol {i % 2 === 0 ? 'tilt-l' : 'tilt-r'}"
				style="--ed: {i * 0.08}s; --float-dur: {i % 2 === 0 ? '7s' : '8s'};"
				aria-label={`${caption}. Ketuk untuk perbesar.`}
				onclick={() => (active = i)}
			>
				<span class="float">
					<span class="photo-wrap">
						<img
							src={photo(i)}
							alt={caption}
							loading="lazy"
							decoding="async"
							style="filter: grayscale(1) sepia(0.5) contrast(1.1) brightness(0.85);"
						/>
					</span>
				</span>
				<span class="cap">{caption}</span>
				<span class="tap" aria-hidden="true">tap</span>
			</button>
		{/each}
	</div>

	<p class="eyebrow eyebrow--story">Perjalanan kita</p>
	<div class="timeline">
		{#each story as entry, i}
			{@const isOpen = open >= i}
			<div class="t-row" class:open={isOpen}>
				<span class="dot" aria-hidden="true">{entry.year.slice(-2)}</span>
				<button
					type="button"
					class="t-head"
					aria-expanded={isOpen}
					onclick={() => pick(i)}
				>
					<span class="t-year">{entry.year}</span>
					<span class="chev" aria-hidden="true"></span>
				</button>
				<p class="t-title">{entry.title}</p>
				<div class="t-bodywrap">
					<p class="t-body">{entry.body}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

{#if active !== null}
	<div
		class="veil"
		role="dialog"
		aria-modal="true"
		aria-label={gallery[active]}
	>
		<button type="button" class="veil-close" onclick={() => (active = null)} aria-label="Tutup">
			<img
				src={photo(active)}
				alt={gallery[active]}
				style="filter: grayscale(1) sepia(0.5) contrast(1.1) brightness(0.85);"
			/>
		</button>
		<p class="veil-cap">{gallery[active]}</p>
		<span class="veil-hint">Ketuk mana aja buat tutup</span>
	</div>
{/if}

<style>
	/* Jewel Romance scope. Token lokal isolasi, global editorial aman. */
	.moment {
		--jewel-paper-2: #fffaf3;
		--jewel-ink: #3a1320;
		--jewel-ink-soft: #8a6573;
		--jewel-line: #ecd2d6;
		--jewel-rust: #7c1f33;
		--jewel-cream: #f8efe0;
		/* Lepas pagar 60% global. Full lebar phone seperti cardflip. */
		margin-inline: calc(var(--spacing-page-inset) * -1);
		padding-top: var(--spacing-l);
		opacity: 0;
		transform: translateY(18px);
		transition:
			opacity 0.6s ease,
			transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.moment.visible {
		opacity: 1;
		transform: none;
	}

	.eyebrow {
		margin: 0 0 var(--spacing-s);
		text-align: center;
		font-family: var(--font-text);
		font-weight: var(--font-weight-regular);
		font-size: 10px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--jewel-ink-soft);
	}

	.eyebrow--story {
		margin-top: var(--spacing-l);
	}

	.moment-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		padding-inline: 10px;
	}

	.pol {
		position: relative;
		padding: 10px;
		padding-bottom: 16px;
		border: 1px solid var(--jewel-line);
		border-radius: 1.25rem;
		background: var(--jewel-paper-2);
		box-shadow: 0 8px 30px rgba(58, 19, 32, 0.08);
		cursor: pointer;
		opacity: 0;
		transform: translateY(18px);
		transition:
			opacity 0.5s ease,
			transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1);
		animation: jewel-float var(--float-dur, 7s) ease-in-out 1s infinite;
	}

	.moment.visible .pol {
		opacity: 1;
		transform: translateY(0);
		transition-delay: var(--ed, 0s);
	}

	.tilt-l {
		transform: translateY(18px) rotate(-2deg);
	}

	.tilt-r {
		transform: translateY(18px) rotate(2deg);
	}

	.moment.visible .tilt-l {
		transform: rotate(-2deg);
	}

	.moment.visible .tilt-r {
		transform: rotate(2deg);
	}

	.float {
		display: block;
	}

	@keyframes jewel-float {
		0%,
		100% {
			translate: 0 0;
		}
		50% {
			translate: 0 -4px;
		}
	}

	.photo-wrap {
		display: block;
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		border-radius: 0.75rem;
		border: 1px solid var(--jewel-line);
	}

	.photo-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.cap {
		display: block;
		margin-top: 8px;
		text-align: center;
		font-family: var(--font-text);
		font-weight: var(--font-weight-regular);
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--jewel-ink-soft);
	}

	.tap {
		position: absolute;
		top: 8px;
		right: 8px;
		padding: 2px 8px;
		border-radius: 999px;
		background: var(--jewel-paper-2);
		font-family: var(--font-text);
		font-size: 9px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--jewel-rust);
	}

	.timeline {
		position: relative;
		margin-left: 12px;
		padding-left: 24px;
		border-left: 2px dashed var(--jewel-line);
	}

	.t-row {
		position: relative;
		padding-bottom: 28px;
		opacity: 0.4;
		transition: opacity 0.5s ease;
	}

	.t-row:last-child {
		padding-bottom: 0;
	}

	.t-row.open {
		opacity: 1;
	}

	.dot {
		position: absolute;
		left: -2.45rem;
		top: 2px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--jewel-rust);
		color: var(--jewel-cream);
		font-family: var(--font-text);
		font-size: 9px;
		animation: dot-pulse 2.6s ease-in-out infinite;
	}

	@keyframes dot-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(124, 31, 51, 0.35);
		}
		50% {
			box-shadow: 0 0 0 6px rgba(124, 31, 51, 0);
		}
	}

	.t-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.t-year {
		font-family: var(--font-text);
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--jewel-rust);
	}

	.chev {
		width: 8px;
		height: 8px;
		border-right: 2px solid var(--jewel-ink-soft);
		border-bottom: 2px solid var(--jewel-ink-soft);
		transform: rotate(45deg);
		transition: transform 0.4s ease;
	}

	.t-row.open .chev {
		transform: rotate(225deg);
		border-color: var(--jewel-rust);
	}

	.t-title {
		margin: 4px 0 0;
		font-family: var(--font-display);
		font-weight: var(--font-weight-regular);
		font-size: 16px;
		color: var(--jewel-ink);
	}

	.t-bodywrap {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.t-row.open .t-bodywrap {
		grid-template-rows: 1fr;
	}

	.t-body {
		margin: 0;
		overflow: hidden;
		padding-top: 0;
		font-size: 14px;
		line-height: 1.45;
		color: var(--jewel-ink-soft);
	}

	.t-row.open .t-body {
		padding-top: 4px;
	}

	.veil {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 24px;
		background: rgba(250, 243, 234, 0.92);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.veil-close {
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.veil-close img {
		width: 80vw;
		max-width: 18rem;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		border-radius: 1.5rem;
		box-shadow: 0 20px 50px rgba(58, 19, 32, 0.25);
	}

	.veil-cap {
		margin: 0;
		font-family: var(--font-text);
		font-size: 12px;
		color: var(--jewel-ink);
	}

	.veil-hint {
		font-family: var(--font-text);
		font-size: 10px;
		color: var(--jewel-ink-soft);
	}

	@media (prefers-reduced-motion: reduce) {
		.moment,
		.pol {
			transition: none;
			opacity: 1;
			transform: none;
		}
		.moment.visible .tilt-l,
		.moment.visible .tilt-r {
			transform: none;
		}
		.pol,
		.dot {
			animation: none;
		}
		.t-bodywrap {
			transition: none;
		}
	}
</style>
