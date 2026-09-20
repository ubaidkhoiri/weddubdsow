<script lang="ts">
	import { gallery } from "./content";
	import SectionHeading from "./SectionHeading.svelte";

	let dialog: HTMLDialogElement;
	let active = $state<string | null>(null);

	function openPhoto(src: string) {
		active = src;
		dialog.showModal();
	}

	function closePhoto() {
		active = null;
		dialog.close();
	}
</script>

<section class="section" id="gallery" aria-labelledby="gallery-h">
	<SectionHeading eyebrow="Galeri" title="Momen Terindah" numeral="04" id="gallery-h" />
	<p class="intro">Ketuk foto untuk melihat lebih dekat.</p>

	<ul class="grid">
		{#each gallery as photo (photo.src)}
			<li>
				<button class="thumb" type="button" onclick={() => openPhoto(photo.src)} aria-label={photo.alt}>
					<img src={photo.src} alt={photo.alt} loading="lazy" />
				</button>
			</li>
		{/each}
	</ul>

	<dialog bind:this={dialog} onclose={closePhoto} class="lightbox">
		{#if active}
			<img src={active} alt="" />
		{/if}
		<button class="close" type="button" onclick={closePhoto}>Tutup</button>
	</dialog>
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-stack);
	}

	.intro {
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-s);
	}

	.thumb {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		border-radius: var(--radius-surface);
		background: transparent;
		cursor: pointer;
	}

	.thumb img {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 4;
		object-fit: cover;
		border-radius: var(--radius-surface);
	}

	.thumb:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.lightbox {
		width: min(90vw, 430px);
		max-width: none;
		padding: var(--spacing-s);
		border: 0;
		border-radius: var(--radius-surface);
		background: var(--color-bg-overlay);
		box-shadow: var(--shadow-raised);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.lightbox img {
		display: block;
		width: 100%;
		max-height: 70svh;
		object-fit: contain;
		border-radius: var(--radius-sm);
	}

	.close {
		align-self: center;
		min-height: var(--size-touch-target);
		padding: var(--spacing-xs) var(--spacing-m);
		font-size: var(--text-body);
		color: var(--color-text-strong);
		background: var(--color-bg-base);
		border: 1px solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
	}

	.close:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}
</style>