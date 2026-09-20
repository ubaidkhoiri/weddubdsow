<script lang="ts">
	import { couple, event, inviteMessage } from "./content";
</script>

<section class="section" id="closing" aria-labelledby="closing-h">
	<p class="eyebrow">Penutup</p>
	<h2 id="closing-h">Doa dan Restu</h2>
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
	}

	.eyebrow {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-weak);
		margin: 0;
	}

	h2 {
		font-size: var(--text-h2);
		line-height: var(--leading-h2);
		color: var(--color-text-strong);
		margin: 0;
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
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-strong);
		margin: 0;
	}
</style>