<script lang="ts">
	import { couple, event, inviteMessage } from "./content";
	import SectionHeading from "./SectionHeading.svelte";
</script>

<section class="section" id="closing" aria-labelledby="closing-h">
	<SectionHeading eyebrow="Penutup" title="Doa dan Restu" numeral="07" id="closing-h" />
	<div class="card">
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
		<p class="prose">{inviteMessage}</p>
		<p class="prose">{event.closingLine}</p>
		<p class="signature">Yang berbahagia,</p>
		<p class="couple">{couple.groom} &amp; {couple.bride}</p>
	</div>
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-s);
		padding: var(--spacing-l) var(--spacing-m);
		text-align: center;
		background: var(--color-bg-raised);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
	}

	.crest {
		color: var(--color-accent);
	}

	.prose {
		max-width: var(--measure-prose);
		font-size: var(--text-prose);
		line-height: var(--leading-prose);
		color: var(--color-text-weak);
		margin: 0;
	}

	.signature {
		margin-top: var(--spacing-s);
		font-size: var(--text-body);
		color: var(--color-text-weak);
	}

	.couple {
		font-family: var(--font-display);
		font-weight: var(--font-weight-regular);
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-brand);
		margin: 0;
	}
</style>