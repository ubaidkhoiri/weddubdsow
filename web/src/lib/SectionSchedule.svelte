<script lang="ts">
	import { days, event } from "./content";
	import SectionHeading from "./SectionHeading.svelte";
</script>

<section class="section" id="schedule" aria-labelledby="schedule-h">
	<SectionHeading eyebrow="Jadwal" title="Rangkaian Acara" numeral="03" id="schedule-h" />

	<ul class="cards">
		{#each days as day (day.title)}
			<li class="card">
				<p class="date">{day.date}</p>
				<h3>{day.title}</h3>
				<p class="time">Pukul {day.time}</p>
				<p class="note">{day.note}</p>
			</li>
		{/each}
	</ul>

	<div class="venue">
		<p class="venue-name">{event.venue}</p>
		<p class="venue-address">{event.venueAddress}</p>
		<a href={event.mapsUrl} target="_blank" rel="noreferrer">Buka lokasi di peta</a>
	</div>
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-stack);
	}

	.cards {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
		border-bottom: 1px solid var(--color-stroke-weak);
	}

	.card h3 {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
		margin: 0;
	}

	.date {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-accent-gold);
		margin: 0;
	}

	.time {
		font-size: var(--text-lead);
		font-weight: var(--font-weight-regular);
		font-family: var(--font-display);
		line-height: var(--leading-body);
		color: var(--color-text-strong);
		margin: 0;
	}

	.note {
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	.venue {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
	}

	.venue-name {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
		margin: 0;
	}

	.venue-address {
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	.venue a {
		color: var(--color-text-strong);
		font-size: var(--text-body);
		text-underline-offset: 4px;
		text-decoration-thickness: 2px;
	}
</style>