<script lang="ts">
	import { story } from "./content";
	import SectionHeading from "./SectionHeading.svelte";
</script>

<section class="section" id="story" aria-labelledby="story-h">
	<SectionHeading eyebrow="Kisah Kami" title="Perjalanan Kami" numeral="02" id="story-h" />
	<ol class="timeline">
		{#each story as step (step.title)}
			<li class="step">
				<span class="dot" aria-hidden="true"></span>
				<div class="body">
					<p class="date">{step.date}</p>
					<h3>{step.title}</h3>
					<p>{step.text}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-stack);
		padding-block: var(--spacing-section);
		padding-inline: var(--spacing-m);
	}

	.timeline {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		border-inline-start: var(--border-width-strong) solid var(--color-stroke-brand-weak);
		padding-inline-start: var(--spacing-m);
	}

	.step {
		position: relative;
		padding-bottom: var(--spacing-s);
	}

	.dot {
		position: absolute;
		left: calc(var(--spacing-m) * -1 - 4px);
		top: 6px;
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
		background: var(--color-text-brand);
		transform: translateX(-50%);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
	}

	.date {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-brand);
		margin: 0;
	}

	h3 {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		font-weight: var(--font-weight-regular);
		color: var(--color-text-strong);
		margin: 0;
	}

	.body p:last-child {
		font-size: var(--text-prose);
		line-height: var(--leading-prose);
		color: var(--color-text-weak);
		max-width: var(--measure-prose);
		margin: 0;
	}
</style>