<script lang="ts">
	let {
		eyebrow = "",
		title = "",
		numeral = "",
		id = "",
	}: { eyebrow?: string; title: string; numeral?: string; id?: string } = $props();
</script>

<div class="heading">
	<div class="head-row">
		<div>
			{#if eyebrow}
				<p class="eyebrow">{eyebrow}</p>
			{/if}
			<h2 {id}>{title}</h2>
		</div>
		{#if numeral}
			<span class="numeral" aria-hidden="true">{numeral}</span>
		{/if}
	</div>
</div>

<style>
	.heading {
		padding-inline: var(--spacing-2xs);
		padding-top: var(--spacing-xs);
		padding-bottom: var(--spacing-xs);
	}

	.head-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--spacing-s);
	}

	.eyebrow {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-brand);
		margin: 0 0 var(--spacing-2xs);
	}

	h2 {
		margin: 0;
		color: var(--color-text-strong);
	}

	.numeral {
		font-family: var(--font-display);
		font-size: var(--text-body);
		font-weight: var(--font-weight-regular);
		color: var(--color-accent);
		font-variant-numeric: tabular-nums;
		line-height: 1.5;
	}
</style>