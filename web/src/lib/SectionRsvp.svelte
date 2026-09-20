<script lang="ts">
	import { onMount } from "svelte";
	import { postRsvp, type Attendance } from "./api";

	const DRAFT_KEY = "weddu-rsvp-draft";

	let name = $state("");
	let attendance = $state<Attendance | "">("");
	let guests = $state("1");
	let phone = $state("");
	let fieldErrors = $state<Record<string, string>>({});
	let summary = $state<{ kind: "error" | "success"; text: string } | null>(null);
	let submitting = $state(false);

	function saveDraft() {
		if (typeof localStorage === "undefined") return;
		localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, attendance, guests, phone }));
	}

	onMount(() => {
		if (typeof localStorage === "undefined") return;
		try {
			const raw = localStorage.getItem(DRAFT_KEY);
			if (!raw) return;
			const draft = JSON.parse(raw);
			if (typeof draft?.name === "string") name = draft.name;
			if (["yes", "no", "maybe"].includes(draft?.attendance)) attendance = draft.attendance;
			if (typeof draft?.guests === "string") guests = draft.guests;
			if (typeof draft?.phone === "string") phone = draft.phone;
		} catch {
			localStorage.removeItem(DRAFT_KEY);
		}
	});

	function validateClient(): boolean {
		const errors: Record<string, string> = {};
		if (name.trim().length === 0) {
			errors.name = "Tulis nama kamu dulu.";
		} else if (name.trim().length > 120) {
			errors.name = "Nama terlalu panjang, maksimal 120 karakter.";
		}
		if (attendance === "") {
			errors.attendance = "Pilih salah satu: Ya, Tidak, atau Mungkin.";
		}
		const count = Number(guests);
		if (!Number.isInteger(count) || count < 1 || count > 5) {
			errors.guests = "Jumlah tamu antara 1 sampai 5.";
		}
		if (phone.trim().length > 20) {
			errors.phone = "Nomor terlalu panjang, maksimal 20 karakter.";
		}
		fieldErrors = errors;
		return Object.keys(errors).length === 0;
	}

	async function submit() {
		if (!validateClient()) {
			summary = {
				kind: "error",
				text: "Beberapa kolom belum benar. Periksa yang ditandai.",
			};
			return;
		}
		submitting = true;
		const result = await postRsvp({
			name: name.trim(),
			attendance: attendance as Attendance,
			guests: Number(guests),
			phone: phone.trim() === "" ? undefined : phone.trim(),
		});
		submitting = false;
		if (result.ok) {
			localStorage.removeItem(DRAFT_KEY);
			name = "";
			attendance = "";
			guests = "1";
			phone = "";
			fieldErrors = {};
			summary = {
				kind: "success",
				text: "Terima kasih sudah mengonfirmasi. Sampai jumpa di hari bahagia.",
			};
		} else {
			summary = {
				kind: "error",
				text:
					result.errors.length > 0
						? result.errors.join(" ")
						: "Kami tidak bisa menyimpan jawabanmu. Coba lagi beberapa saat.",
			};
		}
	}
</script>

<section class="section" id="rsvp" aria-labelledby="rsvp-h">
	<p class="eyebrow">Konfirmasi</p>
	<h2 id="rsvp-h">Konfirmasi Kehadiran</h2>
	<p class="intro">Beri tahu kami apakah kamu bisa hadir.</p>

	{#if summary}
		<p class="summary" class:error={summary.kind === "error"} class:success={summary.kind === "success"} role="status" aria-live="polite">
			{summary.text}
		</p>
	{/if}

	<form onsubmit={(e) => { e.preventDefault(); submit(); }} novalidate>
		<div class="field">
			<label for="rsvp-name">Nama <span class="req">(wajib)</span></label>
			<input
				id="rsvp-name"
				type="text"
				autocomplete="name"
				enterkeyhint="next"
				bind:value={name}
				onblur={saveDraft}
				aria-invalid={fieldErrors.name ? "true" : undefined}
				aria-describedby={fieldErrors.name ? "rsvp-name-err" : undefined}
			/>
			{#if fieldErrors.name}
				<p class="error" id="rsvp-name-err">{fieldErrors.name}</p>
			{/if}
		</div>

		<fieldset class="field radios">
			<legend>Apakah kamu bisa hadir? <span class="req">(wajib)</span></legend>
			<label>
<input type="radio" name="attendance" value="yes" bind:group={attendance} onblur={saveDraft} />
			<span>Ya, hadir</span>
			</label>
			<label>
				<input type="radio" name="attendance" value="no" bind:group={attendance} onblur={saveDraft} />
				<span>Tidak bisa hadir</span>
			</label>
			<label>
				<input type="radio" name="attendance" value="maybe" bind:group={attendance} onblur={saveDraft} />
				<span>Mungkin</span>
			</label>
			{#if fieldErrors.attendance}
				<p class="error" id="rsvp-att-err">{fieldErrors.attendance}</p>
			{/if}
		</fieldset>

		<div class="field">
			<label for="rsvp-guests">Jumlah tamu yang hadir <span class="req">(wajib)</span></label>
			<select id="rsvp-guests" bind:value={guests} onblur={saveDraft} aria-invalid={fieldErrors.guests ? "true" : undefined}>
				{#each [1, 2, 3, 4, 5] as count (count)}
					<option value={count}>{count} orang</option>
				{/each}
			</select>
			{#if fieldErrors.guests}
				<p class="error" id="rsvp-guests-err">{fieldErrors.guests}</p>
			{/if}
		</div>

		<div class="field">
			<label for="rsvp-phone">No. WhatsApp <span class="opt">(opsional)</span></label>
			<input
				id="rsvp-phone"
				type="tel"
				inputmode="tel"
				autocomplete="tel"
				enterkeyhint="done"
				placeholder="08xxxxxxxxxx"
				bind:value={phone}
				onblur={saveDraft}
				aria-invalid={fieldErrors.phone ? "true" : undefined}
			/>
			{#if fieldErrors.phone}
				<p class="error" id="rsvp-phone-err">{fieldErrors.phone}</p>
			{/if}
		</div>

		<button class="primary" type="submit" aria-busy={submitting}>
			{submitting ? "Menyimpan..." : "Kirim konfirmasi"}
		</button>
	</form>
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

	.intro {
		font-size: var(--text-body);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
	}

	.summary {
		padding: var(--spacing-s);
		border-radius: var(--radius-control);
		font-size: var(--text-body);
		line-height: var(--leading-body);
		margin: 0;
	}

	.summary.error {
		color: var(--color-text-error);
		background: var(--color-fill-error);
		border: 1px solid var(--color-stroke-error-strong);
	}

	.summary.success {
		color: var(--color-text-success);
		background: var(--color-fill-success);
		border: 1px solid var(--color-stroke-success-strong);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-label);
	}

	.field label,
	.radios legend {
		font-size: var(--text-body);
		color: var(--color-text-strong);
	}

	.req,
	.opt {
		font-size: var(--text-caption);
		color: var(--color-text-weak);
	}

	.field input,
	.field select {
		min-height: var(--size-control);
		padding: var(--spacing-xs) var(--spacing-s);
		font-size: var(--text-body);
		color: var(--color-text-strong);
		background: var(--color-bg-base);
		border: 1px solid var(--color-stroke-weak);
		border-radius: var(--radius-control);
	}

	.field input:focus-visible,
	.field select:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 1px;
	}

	.field input[aria-invalid="true"],
	.field select[aria-invalid="true"] {
		border-color: var(--color-stroke-error-strong);
	}

	.field .error {
		font-size: var(--text-caption);
		color: var(--color-text-error);
		margin: 0;
	}

	.radios {
		border: 0;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.radios label {
		display: flex;
		align-items: center;
		gap: var(--spacing-s);
		min-height: var(--size-row);
		font-size: var(--text-body);
	}

	.radios input {
		width: var(--size-icon);
		height: var(--size-icon);
		accent-color: var(--color-text-strong);
	}

	.radios input:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
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
</style>