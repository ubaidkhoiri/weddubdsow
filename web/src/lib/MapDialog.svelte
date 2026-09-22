<script lang="ts">
	let { venue = "", mapsUrl = "", showTick = 0 }: { venue?: string; mapsUrl?: string; showTick?: number } = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let src = $state("");

	$effect(() => {
		if (showTick > 0 && dialog && !dialog.open) {
			src = "https://maps.google.com/maps?q=" + encodeURIComponent(venue) + "&output=embed";
			dialog.showModal();
		}
	});
</script>

<dialog bind:this={dialog}>
	<div class="map-head">
		<h3 id="map-title">Lokasi Acara</h3>
		<button class="close" type="button" onclick={() => dialog?.close()} aria-label="Tutup peta">Tutup</button>
	</div>
	{#if src}
		<iframe title="Peta lokasi acara" src={src} loading="lazy" allowfullscreen></iframe>
	{/if}
	<p class="map-link">
		<a href={mapsUrl} target="_blank" rel="noreferrer">Buka di Google Maps</a>
	</p>
</dialog>

<style>
	dialog {
		width: min(92vw, 430px);
		padding: var(--spacing-m);
		border: 1px solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
	}

	dialog::backdrop {
		background: var(--color-bg-overlay);
	}

	.map-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-s);
		margin-bottom: var(--spacing-s);
	}

	.map-head h3 {
		font-family: var(--font-display);
		font-weight: var(--font-weight-regular);
		font-size: var(--text-h3);
		margin: 0;
	}

	.close {
		background: none;
		border: 0;
		padding: var(--spacing-2xs) var(--spacing-s);
		border-radius: var(--radius-control);
		color: var(--color-text-strong);
		font-size: var(--text-body);
		cursor: pointer;
	}

	.close:hover {
		background: var(--color-fill);
	}

	.close:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	iframe {
		width: 100%;
		height: 55vh;
		border: 0;
		border-radius: var(--radius-surface);
		background: var(--color-fill);
	}

	.map-link {
		margin: var(--spacing-s) 0 0;
		text-align: center;
	}

	.map-link a {
		color: var(--color-text-strong);
		text-underline-offset: 4px;
		text-decoration-thickness: 2px;
	}
</style>