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
					<p class="text">{step.text}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.timeline {
		list-style: none;
		padding: var(--spacing-m);
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		background: var(--color-bg-raised);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-surface);
	}

	.step {
		position: relative;
		padding-inline-start: var(--spacing-l);
	}

	.step:not(:last-child)::before {
		content: "";
		position: absolute;
		left: 5px;
		top: 22px;
		bottom: -24px;
		width: var(--border-width-hairline);
		background: var(--color-stroke-weak);
	}

	.dot {
		position: absolute;
		left: 0;
		top: 6px;
		width: 10px;
		height: 10px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
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
		font-weight: var(--font-weight-bold);
		color: var(--color-text-strong);
		margin: 0;
	}

	.text {
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
		margin: 0;
	}
</style>