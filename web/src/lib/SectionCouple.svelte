<script lang="ts">
	import { couple } from "./content";
</script>

<section class="section" id="couple" aria-labelledby="couple-h">
	<p class="eyebrow">Sepasang Mempelai</p>
	<h2 id="couple-h" class="couple-heading">
		<span>Ubaid</span>
		<span class="amp" aria-hidden="true">&amp;</span>
		<span>Sofia</span>
	</h2>
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
	}

	.eyebrow {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-weak);
		margin: 0;
	}

	.couple-heading {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-s);
		font-size: var(--text-h1);
		line-height: var(--leading-h1);
		color: var(--color-text-strong);
		margin: 0;
	}

	.amp {
		color: var(--color-accent-gold);
		font-size: var(--text-h2);
	}

	.note {
		max-width: var(--measure-prose);
		font-size: var(--text-prose);
		line-height: var(--leading-prose);
		color: var(--color-text-weak);
		margin: 0;
	}
</style>