<script lang="ts">
	import { couple, event, inviteMessage } from "./content";
	import SectionHeading from "./SectionHeading.svelte";
</script>

<section class="section" id="closing" aria-labelledby="closing-h">
	<SectionHeading eyebrow="Penutup" title="Doa dan Restu" numeral="05" id="closing-h" />
	<p class="prose">{inviteMessage}</p>
	<p class="prose">{event.closingLine}</p>
	<p class="signature">Yang berbahagia,</p>
	<p class="couple">{couple.groom} &amp; {couple.bride}</p>
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

	.prose {
		max-width: var(--measure-prose);
		font-size: var(--text-prose);
		line-height: var(--leading-prose);
		color: var(--color-text-weak);
		margin: 0;
	}

	.signature {
		margin-top: var(--spacing-m);
		font-size: var(--text-body);
		color: var(--color-text-weak);
	}

	.couple {
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: var(--text-h2);
		line-height: var(--leading-h2);
		color: var(--color-text-strong);
		margin: 0;
	}
</style>