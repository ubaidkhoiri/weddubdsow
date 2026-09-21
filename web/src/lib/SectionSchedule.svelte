<script lang="ts">
	import { days, event } from "./content";
	import SectionHeading from "./SectionHeading.svelte";
	import MapDialog from "./MapDialog.svelte";

	let openTick = $state(0);
</script>

<section class="section" id="schedule" aria-labelledby="schedule-h">
	<SectionHeading eyebrow="Jadwal" title="Rangkaian Acara" numeral="03" id="schedule-h" />

	<div class="stats">
		{#each days as day (day.title)}
			<article class="stat">
				<p class="date">{day.date}</p>
				<h3>{day.title}</h3>
				<p class="time">Pukul {day.time}</p>
				<p class="note">{day.note}</p>
			</article>
		{/each}
	</div>

	<address class="venue-card">
		<div>
			<p class="venue-name">{event.venue}</p>
			<p class="venue-address">{event.venueAddress}</p>
		</div>
		<button class="loc-btn" type="button" onclick={() => openTick++}>
			Buka lokasi di peta
		</button>
	</address>

	<MapDialog venue={event.venue} mapsUrl={event.mapsUrl} showTick={openTick} />
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.stats {
		display: flex;
		gap: var(--spacing-s);
	}

	.stat {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
		padding: var(--spacing-m);
		background: var(--color-bg-raised);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-surface);
	}

	.stat h3 {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-strong);
		margin: 0;
	}

	.date {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-brand);
		margin: 0;
	}

	.time {
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
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

	.venue-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-s);
		padding: var(--spacing-m);
		background: var(--color-bg-raised);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-surface);
		font-style: normal;
	}

	.venue-name {
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
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
		display: inline-flex;
		align-items: center;
		min-height: var(--size-control);
		padding: var(--spacing-xs) var(--spacing-m);
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		color: var(--color-on-brand);
		background: var(--color-brand);
		border: 0;
		border-radius: var(--radius-control);
		cursor: pointer;
		margin-top: var(--spacing-2xs);
	}

	.loc-btn:hover {
		filter: brightness(1.1);
	}

	.loc-btn:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}
</style>