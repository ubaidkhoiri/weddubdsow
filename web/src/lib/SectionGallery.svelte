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
	<div class="card">
		<ul class="grid">
			{#each gallery as photo (photo.src)}
				<li>
					<button
						class="thumb"
						type="button"
						onclick={() => openPhoto(photo.src)}
						aria-label={photo.alt}
					>
						<img src={photo.src} alt={photo.alt} loading="lazy" />
					</button>
				</li>
			{/each}
		</ul>
	</div>

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
		gap: var(--spacing-s);
	}

	.card {
		padding: var(--spacing-s);
		background: var(--color-bg-raised);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-surface);
	}

	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-xs);
	}

	.thumb {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		border-radius: var(--radius-control);
		background: transparent;
		cursor: pointer;
	}

	.thumb img {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 4;
		object-fit: cover;
		border-radius: var(--radius-control);
	}

	.thumb:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.lightbox {
		width: min(90vw, 430px);
		max-width: none;
		padding: var(--spacing-s);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-surface);
		background: var(--color-bg-overlay);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.lightbox img {
		display: block;
		width: 100%;
		max-height: 70svh;
		object-fit: contain;
		border-radius: var(--radius-control);
	}

	.close {
		align-self: center;
		min-height: var(--size-touch-target);
		padding: var(--spacing-xs) var(--spacing-m);
		font-size: var(--text-body);
		color: var(--color-on-brand);
		background: var(--color-brand);
		border: 0;
		border-radius: var(--radius-control);
		cursor: pointer;
	}

	.close:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}
</style>