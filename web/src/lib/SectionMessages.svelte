<script lang="ts">
	import { getMessages, heartMessage, postMessage, type GuestMessage } from "./api";

	let messages = $state<GuestMessage[]>([]);
	let loading = $state(true);
	let loadError = $state(false);
	let name = $state("");
	let text = $state("");
	let nameError = $state("");
	let textError = $state("");
	let postError = $state("");
	let posting = $state(false);

	async function refresh() {
		loading = true;
		loadError = false;
		const result = await getMessages();
		loading = false;
		if (result.ok) {
			messages = result.data;
		} else {
			loadError = true;
		}
	}

	async function submit() {
		nameError = "";
		textError = "";
		postError = "";
		if (name.trim().length === 0 || name.trim().length > 60) {
			nameError = "Tulis nama kamu, maksimal 60 karakter.";
		}
		if (text.trim().length === 0 || text.trim().length > 500) {
			textError = "Tulis pesanmu, maksimal 500 karakter.";
		}
		if (nameError !== "" || textError !== "") {
			return;
		}
		posting = true;
		const result = await postMessage({ name: name.trim(), message: text.trim() });
		posting = false;
		if (result.ok) {
			name = "";
			text = "";
			await refresh();
		} else {
			postError =
				result.errors.length > 0
					? result.errors.join(" ")
					: "Pesan tidak terkirim. Coba lagi sebentar lagi.";
		}
	}

	async function heart(id: string, index: number) {
		const result = await heartMessage(id);
		if (result.ok) {
			messages[index] = { ...messages[index], hearts: messages[index].hearts + 1 };
		}
	}
</script>

<section class="section" id="messages" aria-labelledby="messages-h">
	<p class="eyebrow">Buku Tamu</p>
	<h2 id="messages-h">Tinggalkan Pesan</h2>
	<p class="intro">Tuliskan doa dan ucapan untuk kedua mempelai.</p>

	<form class="compose" onsubmit={(e) => { e.preventDefault(); submit(); }} novalidate>
		{#if postError}
			<p class="post-error" role="alert">{postError}</p>
		{/if}
		<div class="field">
			<label for="msg-name">Nama <span class="req">(wajib)</span></label>
			<input
				id="msg-name"
				type="text"
				autocomplete="name"
				enterkeyhint="next"
				bind:value={name}
				aria-invalid={nameError ? "true" : undefined}
				aria-describedby={nameError ? "msg-name-err" : undefined}
			/>
			{#if nameError}
				<p class="error" id="msg-name-err">{nameError}</p>
			{/if}
		</div>
		<div class="field">
			<label for="msg-text">Pesan <span class="req">(wajib)</span></label>
			<textarea
				id="msg-text"
				rows="3"
				maxlength="500"
				enterkeyhint="send"
				bind:value={text}
				aria-invalid={textError ? "true" : undefined}
				aria-describedby={textError ? "msg-text-err" : undefined}
			></textarea>
			{#if textError}
				<p class="error" id="msg-text-err">{textError}</p>
			{/if}
		</div>
		<button class="primary" type="submit" aria-busy={posting}>
			{posting ? "Mengirim..." : "Kirim pesan"}
		</button>
	</form>

	<div class="list" aria-live="polite">
		<h3>Pesan dari tamu</h3>
		{#if loading}
			<p class="state">Memuat pesan...</p>
		{:else if loadError}
			<p class="state error" role="alert">Pesan belum bisa dimuat.</p>
			<button class="retry" type="button" onclick={refresh}>Muat ulang</button>
		{:else if messages.length === 0}
			<p class="state">Belum ada pesan. Jadilah yang pertama menulis.</p>
		{:else}
			<ul class="feed">
				{#each messages as msg, index (msg.id)}
					<li class="msg">
						<p class="msg-name">{msg.name}</p>
						<p class="msg-text">{msg.message}</p>
						<div class="msg-foot">
							<button
								class="heart"
								type="button"
								onclick={() => heart(msg.id, index)}
								aria-label={`Sukai pesan dari ${msg.name}`}
							>
								<span aria-hidden="true">&#9829;</span>
								{msg.hearts}
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-stack);
		padding-block: var(--spacing-section);
		padding-inline: var(--spacing-m);
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

	h3 {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
		margin: 0;
	}

	.intro {
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	.compose {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
		padding: var(--spacing-card);
		border: 1px solid var(--color-accent-gold-weak);
	}

	.post-error {
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-error);
		background: var(--color-fill-error);
		border: 1px solid var(--color-stroke-error-strong);
		border-radius: var(--radius-control);
		padding: var(--spacing-s);
		margin: 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-label);
	}

	.field label {
		font-size: var(--text-body);
		color: var(--color-text-strong);
	}

	.req {
		font-size: var(--text-caption);
		color: var(--color-text-weak);
	}

	.field input,
	.field textarea {
		min-height: var(--size-control);
		padding: var(--spacing-xs) var(--spacing-s);
		font-size: var(--text-body);
		color: var(--color-text-strong);
		background: var(--color-bg-base);
		border: 1px solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
	}

	.field textarea {
		resize: vertical;
	}

	.field input:focus-visible,
	.field textarea:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 1px;
	}

	.field input[aria-invalid="true"],
	.field textarea[aria-invalid="true"] {
		border-color: var(--color-stroke-error-strong);
	}

	.error {
		font-size: var(--text-caption);
		color: var(--color-text-error);
		margin: 0;
	}

	.primary {
		align-self: flex-start;
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
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.state {
		font-size: var(--text-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	.state.error {
		color: var(--color-text-error);
	}

	.retry {
		align-self: flex-start;
		min-height: var(--size-control);
		padding: var(--spacing-xs) var(--spacing-m);
		font-size: var(--text-body);
		color: var(--color-text-strong);
		background: var(--color-bg-raised);
		border: 1px solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
	}

	.retry:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.feed {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.msg {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
		padding: var(--spacing-s);
		border: 1px solid var(--color-stroke-weak);
	}

	.msg-name {
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-strong);
		margin: 0;
	}

	.msg-text {
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	.msg-foot {
		display: flex;
		justify-content: flex-end;
	}

	.heart {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-2xs);
		min-height: var(--size-touch-target);
		padding: 0 var(--spacing-xs);
		font-size: var(--text-body);
		font-family: inherit;
		color: var(--color-text-weak);
		background: transparent;
		border: 0;
		border-radius: var(--radius-control);
		cursor: pointer;
	}

	.heart:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.heart span {
		color: var(--color-accent-gold);
	}
</style>