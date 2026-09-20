<script lang="ts">
	import { story } from "./content";
</script>

<section class="section" id="story" aria-labelledby="story-h">
	<p class="eyebrow">Kisah Kami</p>
	<h2 id="story-h">Perjalanan Kami</h2>
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

	.timeline {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-card);
		border-inline-start: 2px solid var(--color-accent-gold-weak);
		padding-inline-start: var(--spacing-m);
	}

	.step {
		position: relative;
	}

	.dot {
		position: absolute;
		left: calc(var(--spacing-m) * -1 - 5px);
		top: 6px;
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
		background: var(--color-accent-gold);
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
		color: var(--color-accent-gold);
		margin: 0;
	}

	h3 {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
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