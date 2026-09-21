<script lang="ts">
	import { couple } from "./content";
	import SectionHeading from "./SectionHeading.svelte";
</script>

<section class="section" id="couple" aria-labelledby="couple-h">
	<SectionHeading eyebrow="Sepasang Mempelai" title="Ubaid &amp; Sofia" numeral="01" id="couple-h" />
	<p class="note">{couple.shortNote}</p>

	<div class="profiles">
		<article class="card">
			<h3 class="who">{couple.groom}</h3>
			<p class="bio">{couple.groomBio}</p>
		</article>
		<article class="card">
			<h3 class="who">{couple.bride}</h3>
			<p class="bio">{couple.brideBio}</p>
		</article>
	</div>
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.note {
		margin: 0;
		padding: var(--spacing-s) var(--spacing-m);
		border-radius: var(--radius-control);
		background: var(--color-fill);
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-strong);
	}

	.profiles {
		display: flex;
		gap: var(--spacing-s);
	}

	.card {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-m);
		background: var(--color-bg-raised);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
	}

	.who {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-brand);
		margin: 0;
	}

	.bio {
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
		margin: 0;
	}
</style>