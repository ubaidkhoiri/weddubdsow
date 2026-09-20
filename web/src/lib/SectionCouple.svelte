<script lang="ts">
	import { couple } from "./content";
	import SectionHeading from "./SectionHeading.svelte";
</script>

<section class="section" id="couple" aria-labelledby="couple-h">
	<SectionHeading eyebrow="Sepasang Mempelai" title="Ubaid &amp; Sofia" numeral="01" id="couple-h" />
	<p class="note">{couple.shortNote}</p>
	<p class="note">{couple.groomBio}</p>
	<p class="note">{couple.brideBio}</p>
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-stack);
		text-align: center;
		padding-block: var(--spacing-section);
		padding-inline: var(--spacing-m);
	}

	.note {
		max-width: var(--measure-prose);
		font-size: var(--text-prose);
		line-height: var(--leading-prose);
		color: var(--color-text-weak);
		margin: 0;
	}
</style>