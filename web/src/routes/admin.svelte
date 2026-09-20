<script lang="ts">
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
	<h1>Kelola Undangan</h1>

	{#if !authed}
		<form class="login" onsubmit={(e) => { e.preventDefault(); login(); }}>
			<label for="admin-password">Kata sandi admin</label>
			<input
				id="admin-password"
				name="password"
				type="password"
				bind:value={password}
				autocomplete="current-password"
			/>
			{#if passwordError}
				<p class="error" aria-live="polite">{passwordError}</p>
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
						<small>♥ {m.hearts}</small>
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
		border: 1px solid var(--color-stroke-strong);
		border-radius: var(--radius-sm);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
		font-size: var(--text-body);
	}

	.login input:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.error {
		color: var(--color-text-danger);
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

	.danger {
		color: var(--color-text-danger);
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
		border: 1px solid var(--color-stroke-weak);
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
		border: 1px solid var(--color-stroke-weak);
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