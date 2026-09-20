<script lang="ts">
	import { days, event } from "./content";
	import SectionHeading from "./SectionHeading.svelte";
	import MapDialog from "./MapDialog.svelte";

	let openTick = $state(0);
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
		<button class="loc-btn" type="button" onclick={() => openTick++}>Buka lokasi di peta</button>
	</div>

	<MapDialog venue={event.venue} mapsUrl={event.mapsUrl} showTick={openTick} />
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-stack);
		padding-block: var(--spacing-section);
		padding-inline: var(--spacing-m);
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
		color: var(--color-accent-gold-text);
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

	.loc-btn {
		background: none;
		border: 0;
		padding: 0;
		align-self: flex-start;
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-strong);
		text-underline-offset: 4px;
		text-decoration-thickness: 2px;
		text-decoration-line: underline;
		cursor: pointer;
	}

	.loc-btn:hover {
		background: var(--color-fill);
		text-decoration-line: none;
		border-radius: var(--radius-control);
	}

	.loc-btn:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}
</style>