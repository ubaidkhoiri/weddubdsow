<script lang="ts">
	export type AdminTab = "pesan" | "rsvp" | "ringkasan" | "sheets"

	let {
		active = "pesan",
		onselect
	}: {
		active: AdminTab
		onselect: (tab: AdminTab) => void
	} = $props()

	const tabs: Array<{ key: AdminTab; label: string }> = [
		{ key: "pesan", label: "Pesan" },
		{ key: "rsvp", label: "RSVP" },
		{ key: "ringkasan", label: "Ringkasan" },
		{ key: "sheets", label: "Sheets" }
	]
</script>

<nav class="admin-nav-layer" aria-label="Navigasi admin">
	<div class="admin-nav">
		{#each tabs as t (t.key)}
			<button
				type="button"
				class="admin-nav-btn"
				class:is-active={active === t.key}
				aria-current={active === t.key ? "page" : undefined}
				onclick={() => onselect(t.key)}
			>{t.label}</button>
		{/each}
	</div>
</nav>

<style>
	.admin-nav-layer {
		position: fixed;
		inset: auto 0 0 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 393px;
		z-index: 10;
		display: flex;
		justify-content: center;
		padding: 0 var(--spacing-s) var(--spacing-s);
		pointer-events: none;
	}

	.admin-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2xs);
		width: auto;
		max-width: 100%;
		margin: 0;
		padding: var(--spacing-2xs);
		border-radius: var(--radius-full);
		background: var(--color-bg-overlay);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		pointer-events: auto;
	}

	.admin-nav-btn {
		min-height: var(--size-touch-target);
		padding: var(--spacing-2xs) var(--spacing-s);
		border: 0;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--color-text-weak);
		font-size: var(--text-body);
		font-weight: var(--font-weight-regular);
		cursor: pointer;
		white-space: nowrap;
	}

	.admin-nav-btn:hover {
		color: var(--color-text-strong);
	}

	.admin-nav-btn:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus);
		outline-offset: var(--focus-ring-offset);
	}

	.admin-nav-btn.is-active {
		background: var(--color-text-strong);
		color: var(--color-bg-base);
		font-weight: var(--font-weight-bold);
	}
</style>
