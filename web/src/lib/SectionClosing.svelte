<script lang="ts">
	import { couple, event, inviteMessage } from "./content";
	import SectionHeading from "./SectionHeading.svelte";
</script>

<section class="section" id="closing" aria-labelledby="closing-h">
	<SectionHeading eyebrow="Penutup" title="Doa dan Restu" numeral="05" id="closing-h" />
	<p class="prose">{inviteMessage}</p>
	<p class="prose">{event.closingLine}</p>
	<span class="crest" aria-hidden="true">
		<svg
			viewBox="0 0 40 40"
			width="40"
			height="40"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		>
			<path d="M27 7a15 15 0 1 0 6 19 12.5 12.5 0 0 1-6-19Z" />
			<path d="M32 7.5l1.1 2.4 2.6.3-1.9 1.8.5 2.6-2.3-1.3-2.3 1.3.5-2.6-1.9-1.8 2.6-.3L32 7.5Z" />
		</svg>
	</span>
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

	.crest {
		margin-top: var(--spacing-m);
		color: var(--color-text-brand);
	}

	.couple {
		font-family: var(--font-display);
		font-weight: var(--font-weight-bold);
		font-size: var(--text-h2);
		line-height: var(--leading-h2);
		color: var(--color-text-strong);
		margin: 0;
	}
</style>