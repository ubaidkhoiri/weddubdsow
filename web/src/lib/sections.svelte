<script lang="ts">
	import { couple, days, event, gallery, inviteMessage, story } from "./content";
</script>

<main class="page">
	<section class="section" id="couple" aria-labelledby="couple-h">
		<h2 id="couple-h">Berkat Menanti</h2>
		<p>{couple.shortNote}</p>
		<p>{couple.groomBio}</p>
		<p>{couple.brideBio}</p>
	</section>

	<section class="section" id="story" aria-labelledby="story-h">
		<h2 id="story-h">Perjalanan Kami</h2>
		<ol>
			{#each story as step (step.title)}
				<li>
					<h3>{step.title}</h3>
					<p>{step.text}</p>
				</li>
			{/each}
		</ol>
	</section>

	<section class="section" id="schedule" aria-labelledby="schedule-h">
		<h2 id="schedule-h">Rangkaian Acara</h2>
		<ul>
			{#each days as day (day.title)}
				<li>
					<h3>{day.title}</h3>
					<p>{day.date}, pukul {day.time}</p>
					<p>{day.note}</p>
				</li>
			{/each}
		</ul>
		<p>{event.venue}</p>
		<a href={event.mapsUrl} target="_blank" rel="noreferrer">Lihat lokasi di peta</a>
	</section>

	<section class="section" id="gallery" aria-labelledby="gallery-h">
		<h2 id="gallery-h">Momen Kami</h2>
		<ul class="gallery">
			{#each gallery as photo (photo.src)}
				<li>
					<img src={photo.src} alt={photo.alt} loading="lazy" />
				</li>
			{/each}
		</ul>
	</section>

	<section class="section" id="closing" aria-labelledby="closing-h">
		<h2 id="closing-h">Doa dan Restu</h2>
		<p>{inviteMessage}</p>
		<p>{event.closingLine}</p>
	</section>
</main>

<style>
	.page {
		padding: var(--spacing-section) var(--spacing-m);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-section);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-stack);
	}

	.section h2 {
		font-size: var(--text-h2);
		line-height: var(--leading-h2);
		color: var(--color-text-strong);
		margin: 0;
	}

	.section h3 {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
		margin: 0;
	}

	.section p {
		font-size: var(--text-prose);
		line-height: var(--leading-prose);
		color: var(--color-text-weak);
		max-width: var(--measure-prose);
		margin: 0;
	}

	.section ol,
	.section ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-card);
	}

	.gallery {
		flex-direction: row;
		flex-wrap: wrap;
		gap: var(--spacing-s);
	}

	.gallery li {
		flex: 1 1 44%;
	}

	.gallery img {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 4;
		object-fit: cover;
		border-radius: var(--radius-surface);
	}

	.section a {
		color: var(--color-text-strong);
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
		font-size: var(--text-body);
	}
</style>