<script lang="ts">
	let {
		eyebrow = "",
		title = "",
		numeral = "",
		id = "",
	}: { eyebrow?: string; title: string; numeral?: string; id?: string } = $props();
</script>

<div class="heading">
	{#if eyebrow}
		<p class="eyebrow">{eyebrow}</p>
	{/if}
	<h2 {id}>{title}</h2>
	{#if numeral}
		<span class="numeral" aria-hidden="true">{numeral}</span>
	{/if}
</div>

<style>
	.heading {
		position: relative;
		padding-top: var(--spacing-xs);
		padding-bottom: var(--spacing-s);
		border-bottom: 1px solid var(--color-stroke-weak);
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
		position: absolute;
		top: 0;
		right: 0;
		font-family: var(--font-display);
		font-size: var(--text-h1);
		line-height: var(--leading-h1);
		color: var(--color-stroke-brand-weak);
		font-variant-numeric: tabular-nums;
	}
</style>