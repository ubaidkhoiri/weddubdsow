<script lang="ts">
	import { onMount } from "svelte"
	import {
		deleteAdminMessage,
		getAdminMessages,
		getAdminRsvp,
		postAdminLogin,
		postAdminLogout,
		type GuestMessage,
		type AdminRsvp,
	} from "../lib/api";

	let password = $state("");
	let passwordError = $state("");
	let authed = $state(false);
	let loggingIn = $state(false);
	let showPassword = $state(false)
	let titleEl: HTMLHeadingElement | null = $state(null)

	onMount(() => {
		titleEl?.focus()
	})

	let messages = $state<GuestMessage[]>([]);
	let rsvps = $state<AdminRsvp[]>([]);
	let loading = $state(false);
	let hint = $state("");
	let deleting = $state<string | null>(null);

	async function login() {
		passwordError = "";
		if (!password) {
			passwordError = "Masukkan kata sandi.";
			return;
		}
		loggingIn = true;
		const result = await postAdminLogin(password);
		loggingIn = false;
		if (result.ok) {
			authed = true;
			password = "";
			load();
		} else {
			passwordError = result.errors.join(" ");
		}
	}

	async function load() {
		loading = true;
		hint = "";
		const [m, r] = await Promise.all([getAdminMessages(), getAdminRsvp()]);
		loading = false;
		if (m.ok) {
			messages = m.data;
		} else if (m.status === 401) {
			hint = "Sesi berakhir, masuk lagi.";
			authed = false;
			return;
		} else {
			hint = m.errors.join(" ");
		}
		if (r.ok) {
			rsvps = r.data;
		}
	}

	async function remove(id: string) {
		deleting = id;
		const result = await deleteAdminMessage(id);
		deleting = null;
		if (result.ok) {
			messages = messages.filter((m) => m.id !== id);
		} else {
			hint = result.errors.join(" ");
		}
	}

	async function logout() {
		await postAdminLogout();
		authed = false;
		messages = [];
		rsvps = [];
	}
</script>

<section class="admin">
	<nav class="back" aria-label="Navigasi kembali">
		<a class="back-link" href="#/">← Kembali ke undangan</a>
		<button class="back-link" type="button" onclick={() => { location.hash = "#/" }}>Kembali</button>
	</nav>
	<h1 tabindex="-1" bind:this={titleEl}>Kelola Undangan</h1>

	{#if !authed}
		<form class="login" onsubmit={(e) => { e.preventDefault(); login(); }}>
			<label for="admin-password">Kata sandi admin</label>
			<div class="password-row">
				<input
					id="admin-password"
					name="password"
					type={showPassword ? "text" : "password"}
					bind:value={password}
					autocomplete="current-password"
					aria-describedby={passwordError ? "admin-password-error" : undefined}
				/>
				<button
					class="toggle"
					type="button"
					aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
					aria-pressed={showPassword}
					onclick={() => { showPassword = !showPassword }}
				>{showPassword ? "Sembunyi" : "Tampil"}</button>
			</div>
			{#if passwordError}
				<p id="admin-password-error" class="error" role="alert" aria-live="polite">{passwordError}</p>
			{/if}
			<button class="primary" type="submit" disabled={loggingIn}>
				{loggingIn ? "Memeriksa..." : "Masuk"}
			</button>
		</form>
	{/if}

	{#if hint}
		<p class="hint" aria-live="polite">{hint}</p>
	{/if}

	{#if authed}
		<div class="toolbar">
			<button class="link" type="button" onclick={load}>Muat ulang</button>
			<button class="link" type="button" onclick={logout}>Keluar</button>
		</div>

		{#if loading}
			<p class="hint">Memuat...</p>
		{/if}

		<h2>Pesan Tamu ({messages.length})</h2>
		{#if messages.length === 0}
			<p class="hint">Belum ada pesan.</p>
		{:else}
			<ul class="messages">
				{#each messages as m (m.id)}
					<li>
						<div class="msg-head">
							<strong>{m.name}</strong>
							<button
								class="link danger"
								type="button"
								disabled={deleting === m.id}
								onclick={() => remove(m.id)}
							>{deleting === m.id ? "Menghapus..." : "Hapus"}</button>
						</div>
						<p>{m.message}</p>
						<small>{m.hearts} <span class="heart-ico" aria-hidden="true"><svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M10 17.5 8.8 16.4C5 12.9 2.5 10.6 2.5 7.8 2.5 5.5 4.2 3.8 6.5 3.8c1.4 0 2.7.7 3.5 1.8.8-1.1 2.1-1.8 3.5-1.8 2.3 0 4 1.7 4 4 0 2.8-2.5 5.1-6.3 8.6L10 17.5Z"/></svg></span></small>
					</li>
				{/each}
			</ul>
		{/if}

		<h2>Daftar RSVP ({rsvps.length})</h2>
		{#if rsvps.length === 0}
			<p class="hint">Belum ada RSVP.</p>
		{:else}
			<ul class="rsvps">
				{#each rsvps as g (g.id)}
					<li>
						<strong>{g.name}</strong>
						<span>{g.attendance}</span>
						<span>{g.guests} tamu</span>
						{#if g.phone}<span>{g.phone}</span>{/if}
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</section>

<style>
	.admin {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
		padding: var(--spacing-section) var(--spacing-card);
	}

	.back {
		display: flex;
		align-items: center;
		gap: var(--spacing-s);
	}

	.back-link {
		min-height: var(--size-touch-target);
		display: inline-flex;
		align-items: center;
		color: var(--color-text-strong);
		font-size: var(--text-body);
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
	}

	.back-link:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus);
		outline-offset: var(--focus-ring-offset);
	}

	.admin h1 {
		font-size: var(--text-h1);
		line-height: var(--leading-h1);
		color: var(--color-text-strong);
		margin: 0;
	}

	.admin h2 {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
		margin: 0;
	}

	.login {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
		max-width: 20rem;
	}

	.login input {
		min-height: var(--size-touch-target);
		padding: var(--spacing-s);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
		font-size: var(--text-body);
	}

	.login input:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus);
		outline-offset: var(--focus-ring-offset);
	}

	.password-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-s);
	}

	.password-row input {
		flex: 1;
		min-width: 0;
	}

	.toggle {
		min-height: var(--size-touch-target);
		padding: var(--spacing-2xs) var(--spacing-s);
		background: none;
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
		color: var(--color-text-strong);
		font-size: var(--text-body);
		cursor: pointer;
		flex-shrink: 0;
	}

	.toggle:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus);
		outline-offset: var(--focus-ring-offset);
	}

	.primary {
		align-self: stretch;
		width: 100%;
		min-height: var(--size-control);
		padding: var(--spacing-s) var(--spacing-l);
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		color: var(--color-bg-base);
		background: var(--color-text-strong);
		border: 0;
		border-radius: var(--radius-control);
		cursor: pointer;
	}

	.primary:hover {
		filter: brightness(1.1);
	}

	.primary:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus);
		outline-offset: var(--focus-ring-offset);
	}

	.primary:disabled {
		opacity: var(--opacity-disabled);
		cursor: default;
	}

	.error {
		color: var(--color-text-error);
		margin: 0;
	}

	.hint {
		color: var(--color-text-weak);
		margin: 0;
	}

	.toolbar {
		display: flex;
		gap: var(--spacing-m);
	}

	.link {
		min-height: var(--size-touch-target);
		background: none;
		border: 0;
		padding: 0;
		color: var(--color-text-strong);
		text-decoration: underline;
		font-size: var(--text-body);
	}

	.link:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus);
		outline-offset: var(--focus-ring-offset);
	}

	.danger {
		color: var(--color-text-error);
		background: none;
	}

	.messages {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.messages li {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
		padding: var(--spacing-s);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
	}

	.messages p {
		margin: 0;
	}

	.msg-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-s);
	}

	.rsvps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.rsvps li {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-s);
		align-items: baseline;
		justify-content: space-between;
		padding: var(--spacing-s);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
	}

	.error, .hint {
		font-size: var(--text-body);
	}

	small {
		color: var(--color-text-weak);
	}
</style>