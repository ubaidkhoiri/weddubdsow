<script lang="ts">
	let { active = false }: { active?: boolean } = $props();

	const people = [
		{
			key: "g",
			name: "Ubaid",
			side: "Mempelai Pria",
			seed: "inv-groom",
			tilt: "tilt-l",
			dur: "7s",
			fdelay: "0.8s",
			bio: "Orangnya kalem, tapi tegas di dalem. Suka rencanain masa depan, dan kalau sayang — dia total.",
		},
		{
			key: "b",
			name: "Sofia",
			side: "Mempelai Wanita",
			seed: "inv-bride",
			tilt: "tilt-r",
			dur: "8s",
			fdelay: "1s",
			bio: "Peka banget, suka mikir panjang, tapi justru itu yang bikin dia peduli banget sama orang lain.",
		},
	];

	const hint = "Ketuk kartu untuk kenal mereka lebih dalem";
	const hintLines = [
		["Ketuk", "kartu", "untuk"],
		["kenal", "mereka", "lebih", "dalem"],
	];

	let flip: string | null = $state(null);
	const photo = (seed: string) => `https://picsum.photos/seed/${seed}/520/520?grayscale`;
</script>

<section class="jewel" class:active aria-label="Ubaid dan Sofia">
	<div class="jewel-grid">
		{#each people as person}
			<button
				type="button"
				class="flip"
				style="--float-dur: {person.dur}; --float-delay: {person.fdelay};"
				aria-pressed={flip === person.key}
				aria-label={`${person.name}, ${person.side}. Ketuk untuk membalik kartu.`}
				onclick={() => (flip = flip === person.key ? null : person.key)}
			>
				<span class="flip-inner" data-flipped={flip === person.key}>
					<span class="face front {person.tilt}">
						<span class="float">
							<span class="photo-wrap">
								<img
									src={photo(person.seed)}
									alt={person.name}
									loading="lazy"
									decoding="async"
									style="filter: grayscale(1) sepia(0.5) contrast(1.1) brightness(0.85);"
								/>
							</span>
						</span>
						<span class="face-name">{person.name}</span>
						<span class="face-side">{person.side}</span>
					</span>
					<span class="face back" aria-hidden={flip !== person.key}>
						<span class="back-name">{person.name}</span>
						<span class="face-bio">{person.bio}</span>
					</span>
				</span>
			</button>
		{/each}
	</div>
	<p class="jewel-hint" aria-label={hint}>
		{#each hintLines as line, li}
			<span class="line" aria-hidden="true">
				{#each line as word, wi}
					{@const i = (li === 0 ? 0 : hintLines[0].length) + wi}
					<span class="w" style="--wd: {i}">{word}</span>
					{#if wi < line.length - 1}
						{" "}
					{/if}
				{/each}
			</span>
		{/each}
	</p>
</section>

<style>
	/* Jewel Romance scope. Token lokal isolasi, global editorial aman. */
	.jewel {
		--jewel-paper-2: #fffaf3;
		--jewel-paper-3: #f6dfe6;
		--jewel-ink: #3a1320;
		--jewel-ink-soft: #8a6573;
		--jewel-line: #ecd2d6;
		--jewel-rust: #7c1f33;
		--jewel-cream: #f8efe0;
		display: flex;
		flex-direction: column;
		margin-top: 0;
		/* Parent scene sudah full-bleed. Lebar 90% diatur dari App. */
	}

	.jewel-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		/* Gutter kecil: sudut kartu miring tidak keluar viewport kepotong pin. */
		padding-inline: 10px;
	}

	.flip {
		padding: 0;
		border: 0;
		background: none;
		text-align: left;
		cursor: pointer;
		perspective: 1000px;
		-webkit-perspective: 1000px;
		/* Tinggi ikut konten depan. Back overlay absolut, tidak nambah tinggi. */
		height: auto;
		align-self: start;
		/* Entrance stagger: Ubaid dulu, Sofia menyusul. */
		opacity: 0;
		transform: translateY(24px);
		transition:
			opacity 0.5s ease,
			transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
		/* Loop naik turun sekartu, mulai setelah entrance kelar. */
		animation: jewel-float var(--float-dur, 7s) ease-in-out var(--float-delay, 0.8s) infinite;
	}

	.jewel-grid > .flip:nth-child(2) {
		/* Cascade bertaut: kartu kedua turun sedikit. */
		margin-top: 14px;
	}

	.jewel.active .flip {
		opacity: 1;
		transform: translateY(0);
	}

	.jewel.active .flip:nth-child(1) {
		transition-delay: 0.25s;
	}

	.jewel.active .flip:nth-child(2) {
		transition-delay: 0.45s;
	}

	.flip:focus-visible {
		outline: 2px solid var(--jewel-rust);
		outline-offset: 3px;
		border-radius: 1.5rem;
	}

	.flip-inner {
		position: relative;
		display: block;
		transform-style: preserve-3d;
		-webkit-transform-style: preserve-3d;
		will-change: transform;
		transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.flip-inner[data-flipped="true"] {
		transform: rotateY(180deg);
	}

	.face {
		display: flex;
		flex-direction: column;
		border-radius: 1.5rem;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}

	.front {
		position: relative;
		background: var(--jewel-paper-2);
		border: 1px solid var(--jewel-line);
		box-shadow: 0 8px 30px rgba(58, 19, 32, 0.08);
		padding: 6px;
		padding-bottom: 12px;
	}

	.tilt-l {
		transform: rotate(-2deg);
	}

	.tilt-r {
		transform: rotate(2deg);
	}

	/* Foto tanpa rotasi sendiri: ikut kartu, sudut selalu identik. */

	.float {
		display: block;
	}

	@keyframes jewel-float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}

	.photo-wrap {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		border-radius: 1rem;
		border: 1px solid var(--jewel-line);
	}

	.photo-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.face-name {
		margin-top: 10px;
		text-align: center;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: 15px;
		color: var(--jewel-ink);
		line-height: 1.2;
	}

	.face-side {
		margin-top: 3px;
		text-align: center;
		font-family: var(--font-text);
		font-weight: var(--font-weight-regular);
		font-size: 8px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--jewel-ink-soft);
	}

	.back {
		position: absolute;
		inset: 0;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 12px;
		background: var(--jewel-rust);
		color: var(--jewel-cream);
		transform: rotateY(180deg);
		overflow: hidden;
		/* Tutup fringe aliasing tepi. Outline tidak dipakai:
		   Safari lama gambar outline kotak abaikan radius. */
		box-shadow: inset 0 0 0 1px var(--jewel-rust);
	}

	.back.tilt-l {
		transform: rotateY(180deg) rotate(2deg);
	}

	.back.tilt-r {
		transform: rotateY(180deg) rotate(-2deg);
	}

	/* Belakang sengaja lurus (axis-aligned, no gerigi). Depan tetap miring. */

	.back-name {
		text-align: center;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: 19px;
		line-height: 1.1;
	}

	.face-bio {
		text-align: center;
		font-family: var(--font-text);
		font-weight: var(--font-weight-regular);
		font-size: 11px;
		line-height: 1.55;
	}

	.jewel-hint {
		margin: 44px 0 0;
		text-align: center;
		font-family: var(--font-text);
		font-weight: var(--font-weight-regular);
		font-size: 8px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--jewel-ink-soft);
		/* Kedip lembut loop, gaya tap-hint cover. */
		animation: hint-blink 3.2s var(--ease-in-out) infinite;
	}

	.jewel-hint .line {
		display: block;
	}

	.jewel-hint .w {
		display: inline-block;
		opacity: 0;
		transform: translateY(6px);
		transition:
			opacity 0.4s ease,
			transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.jewel.active .jewel-hint .w {
		opacity: 1;
		transform: translateY(0);
		transition-delay: calc(0.8s + var(--wd) * 0.12s);
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

	@media (prefers-reduced-motion: reduce) {
		.flip-inner {
			transition: none;
		}
		.flip {
			animation: none;
		}
		.flip,
		.jewel-hint .w {
			transition: none;
			opacity: 1;
			transform: none;
		}
		.jewel-hint {
			animation: none;
		}
	}
</style>
