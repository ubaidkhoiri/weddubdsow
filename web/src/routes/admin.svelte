<script lang="ts">
	import { onMount } from "svelte"
	import {
		deleteAdminMessage,
		getAdminMessages,
		getAdminRsvp,
		postAdminLogin,
		postAdminLogout,
		type GuestMessage,
		type AdminRsvp
	} from "../lib/api"
	import AdminNav, { type AdminTab } from "../lib/AdminNav.svelte"
	import AdminGrid, { type GridColumn, type GridDensity } from "../lib/AdminGrid.svelte"

	const pesanColumns: Array<GridColumn> = [
		{ key: "name", label: "Nama", width: 150, sortable: true },
		{ key: "message", label: "Pesan", width: 260, sortable: true },
		{ key: "hearts", label: "Suka", width: 80, sortable: true },
		{ key: "created_at", label: "Waktu", width: 190, sortable: true }
	]
	const rsvpColumns: Array<GridColumn> = [
		{ key: "name", label: "Nama", width: 150, sortable: true },
		{ key: "attendance", label: "Kehadiran", width: 120, sortable: true },
		{ key: "guests", label: "Tamu", width: 80, sortable: true },
		{ key: "phone", label: "Telepon", width: 130, sortable: false },
		{ key: "created_at", label: "Waktu", width: 190, sortable: true }
	]
	const pesanEditable = ["name", "message"]
	const rsvpEditable = ["name", "attendance", "guests", "phone"]

	let password = $state("")
	let passwordError = $state("")
	let authed = $state(false)
	let loggingIn = $state(false)
	let showPassword = $state(false)
	let titleEl: HTMLHeadingElement | null = $state(null)

	onMount(() => {
		titleEl?.focus()
	})

	let tab: AdminTab = $state("pesan")
	let query = $state("")
	let attendance = $state("")
	let page = $state(1)
	let limit = $state(20)
	let density: GridDensity = $state("nyaman")
	let pesanRows = $state<Array<Record<string, unknown>>>([])
	let rsvpRows = $state<Array<Record<string, unknown>>>([])
	let pesanTotal = $state(0)
	let rsvpTotal = $state(0)
	let listLoading = $state(false)
	let listError = $state("")
	let hint = $state("")
	let searchTimer: ReturnType<typeof setTimeout> | null = null

	let sumMsgs = $state(0)
	let sumRsvps = $state(0)
	let sumTamu = $state(0)
	let sumHadir = $state(0)
	let sumAbsen = $state(0)

	let activeRows = $derived(tab === "pesan" ? pesanRows : rsvpRows)
	let activeTotal = $derived(tab === "pesan" ? pesanTotal : rsvpTotal)
	let pageCount = $derived(Math.max(1, Math.ceil(activeTotal / limit)))

	function toRows(list: Array<GuestMessage> | Array<AdminRsvp>) {
		return list.map((r) => ({ ...(r as unknown as Record<string, unknown>) }))
	}

	function parseList(json: unknown) {
		if (Array.isArray(json)) return { rows: toRows(json as Array<GuestMessage>), total: json.length }
		const body = json as { rows?: Array<GuestMessage>, total?: number }
		return { rows: toRows(body.rows ?? []), total: body.total ?? 0 }
	}

	async function readJson(res: Response) {
		try {
			return await res.json()
		} catch {
			return null
		}
	}

	async function loadList() {
		if (!authed) return
		listLoading = true
		listError = ""
		const params = new URLSearchParams()
		const q = query.trim()
		if (q !== "") params.set("q", q)
		if (tab === "rsvp" && attendance !== "") params.set("attendance", attendance)
		params.set("page", String(page))
		params.set("limit", String(limit))
		const path = tab === "pesan" ? "/api/admin/messages?" + params : "/api/admin/rsvp?" + params
		let failed = ""
		try {
			const res = await fetch(path)
			if (res.status === 401) {
				authed = false
				hint = "Sesi berakhir, masuk lagi."
				return
			}
			if (!res.ok) {
				const body = await readJson(res)
				const msg = (body as { error?: string } | null)?.error
				failed = typeof msg === "string" && msg !== "" ? msg : "Gagal memuat data."
			} else {
				const parsed = parseList(await res.json())
				if (tab === "pesan") {
					pesanRows = parsed.rows
					pesanTotal = parsed.total
				} else {
					rsvpRows = parsed.rows
					rsvpTotal = parsed.total
				}
			}
		} catch {
			failed = "Tidak dapat terhubung ke server. Coba lagi."
		}
		listLoading = false
		listError = failed
	}

	async function loadSummary() {
		const [m, r] = await Promise.all([getAdminMessages(), getAdminRsvp()])
		if (!m.ok && m.status === 401) {
			authed = false
			hint = "Sesi berakhir, masuk lagi."
			return
		}
		if (m.ok) sumMsgs = m.data.length
		if (r.ok) {
			const list = r.data
			sumRsvps = list.length
			sumTamu = list.reduce((sum, g) => sum + g.guests, 0)
			sumHadir = list.filter((g) => g.attendance === "yes").length
			sumAbsen = list.filter((g) => g.attendance === "no").length
		}
	}

	function refreshAll() {
		loadList()
		loadSummary()
	}

	async function login() {
		passwordError = ""
		if (!password) {
			passwordError = "Masukkan kata sandi."
			return
		}
		loggingIn = true
		const result = await postAdminLogin(password)
		loggingIn = false
		if (result.ok) {
			authed = true
			password = ""
			page = 1
			refreshAll()
		} else {
			passwordError = result.errors.join(" ")
		}
	}

	async function logout() {
		await postAdminLogout()
		authed = false
		pesanRows = []
		rsvpRows = []
		pesanTotal = 0
		rsvpTotal = 0
	}

	function selectTab(t: AdminTab) {
		tab = t
		page = 1
		query = ""
		attendance = ""
		loadList()
	}

	function handleQuery(value: string) {
		query = value
		page = 1
		if (searchTimer) clearTimeout(searchTimer)
		searchTimer = setTimeout(() => loadList(), 300)
	}

	function handleAttendance(value: string) {
		attendance = value
		page = 1
		loadList()
	}

	function handleLimit(value: number) {
		limit = Number.isInteger(value) && value > 0 ? value : 20
		page = 1
		loadList()
	}

	function handlePage(value: number) {
		page = Math.min(pageCount, Math.max(1, value))
		loadList()
	}

	function handleDensity(value: GridDensity) {
		density = value
	}

	async function addRow() {
		hint = ""
		const body = tab === "pesan"
			? { name: "Tamu baru", message: "Baru" }
			: { name: "Tamu baru", attendance: "maybe", guests: 1 }
		const path = tab === "pesan" ? "/api/messages" : "/api/rsvp"
		try {
			const res = await fetch(path, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			})
			if (!res.ok) hint = "Gagal menambah baris."
			else refreshAll()
		} catch {
			hint = "Tidak dapat terhubung ke server. Coba lagi."
		}
	}

	async function insertRow(id: string, where: "atas" | "bawah") {
		hint = ""
		const current = activeRows
		const index = current.findIndex((r) => String(r.id) === id)
		const draft = tab === "pesan"
			? { id: "sementara-" + Date.now(), name: "Tamu baru", message: "Baru", hearts: 0, created_at: new Date().toISOString() }
			: { id: "sementara-" + Date.now(), name: "Tamu baru", attendance: "maybe", guests: 1, phone: null, created_at: new Date().toISOString() }
		const at = index < 0 ? current.length : where === "atas" ? index : index + 1
		const next = [...current]
		next.splice(at, 0, draft)
		if (tab === "pesan") pesanRows = next
		else rsvpRows = next
		await addRow()
	}

	function insertAbove(id: string) {
		insertRow(id, "atas")
	}

	function insertBelow(id: string) {
		insertRow(id, "bawah")
	}

	async function removeRow(id: string) {
		hint = ""
		if (id.startsWith("sementara-")) {
			pesanRows = pesanRows.filter((r) => String(r.id) !== id)
			rsvpRows = rsvpRows.filter((r) => String(r.id) !== id)
			return
		}
		if (tab === "pesan") {
			const result = await deleteAdminMessage(id)
			if (result.ok) {
				pesanRows = pesanRows.filter((r) => String(r.id) !== id)
				pesanTotal = Math.max(0, pesanTotal - 1)
				loadSummary()
			} else hint = result.errors.join(" ")
			return
		}
		try {
			const res = await fetch("/api/admin/rsvp/" + encodeURIComponent(id), { method: "DELETE" })
			if (res.status === 401) {
				authed = false
				hint = "Sesi berakhir, masuk lagi."
				return
			}
			if (!res.ok) hint = "Gagal menghapus baris."
			else {
				rsvpRows = rsvpRows.filter((r) => String(r.id) !== id)
				rsvpTotal = Math.max(0, rsvpTotal - 1)
				loadSummary()
			}
		} catch {
			hint = "Tidak dapat terhubung ke server. Coba lagi."
		}
	}

	async function editCell(id: string, key: string, value: unknown) {
		hint = ""
		if (id.startsWith("sementara-")) {
			const patch = (list: Array<Record<string, unknown>>) =>
				list.map((r) => (String(r.id) === id ? { ...r, [key]: value } : r))
			if (tab === "pesan") pesanRows = patch(pesanRows)
			else rsvpRows = patch(rsvpRows)
			return
		}
		const path = tab === "pesan"
			? "/api/admin/messages/" + encodeURIComponent(id)
			: "/api/admin/rsvp/" + encodeURIComponent(id)
		try {
			const res = await fetch(path, {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ [key]: value })
			})
			if (res.status === 401) {
				authed = false
				hint = "Sesi berakhir, masuk lagi."
				return
			}
			if (!res.ok) {
				const body = await readJson(res)
				const errors = (body as { errors?: Array<string> } | null)?.errors
				hint = errors && errors.length > 0 ? errors.join(" ") : "Gagal menyimpan perubahan."
				return
			}
			const patch = (list: Array<Record<string, unknown>>) =>
				list.map((r) => (String(r.id) === id ? { ...r, [key]: value } : r))
			if (tab === "pesan") pesanRows = patch(pesanRows)
			else rsvpRows = patch(rsvpRows)
		} catch {
			hint = "Tidak dapat terhubung ke server. Coba lagi."
		}
	}
</script>

<section class="admin">
	<nav class="back" aria-label="Navigasi kembali">
		<a class="back-link" href="#/">← Kembali ke undangan</a>
		<button class="back-link" type="button" onclick={() => { location.hash = "#/" }}>Kembali</button>
	</nav>
	<h1 tabindex="-1" bind:this={titleEl}>Kelola Undangan</h1>

	{#if !authed}
		<form class="login" onsubmit={(e) => { e.preventDefault(); login() }}>
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
			<button class="link" type="button" onclick={() => refreshAll()}>Muat ulang</button>
			<button class="link" type="button" onclick={() => logout()}>Keluar</button>
		</div>

		<div class="tab-panel">
			{#if tab === "pesan"}
				<h2>Pesan Tamu ({pesanTotal})</h2>
				<AdminGrid
					dataset="pesan"
					columns={pesanColumns}
					rows={activeRows}
					total={activeTotal}
					loading={listLoading}
					error={listError}
					query={query}
					attendance={attendance}
					showAttendance={false}
					density={density}
					editableKeys={pesanEditable}
					page={page}
					pageCount={pageCount}
					limit={limit}
					emptyLabel="Belum ada pesan."
					onquery={handleQuery}
					onattendance={handleAttendance}
					onadd={addRow}
					ondensity={handleDensity}
					oninsertabove={insertAbove}
					oninsertbelow={insertBelow}
					ondelete={removeRow}
					onedit={editCell}
					onpage={handlePage}
					onlimit={handleLimit}
					onreload={() => loadList()}
				/>
			{:else if tab === "rsvp"}
				<h2>Daftar RSVP ({rsvpTotal})</h2>
				<AdminGrid
					dataset="rsvp"
					columns={rsvpColumns}
					rows={activeRows}
					total={activeTotal}
					loading={listLoading}
					error={listError}
					query={query}
					attendance={attendance}
					showAttendance={true}
					density={density}
					editableKeys={rsvpEditable}
					page={page}
					pageCount={pageCount}
					limit={limit}
					emptyLabel="Belum ada RSVP."
					onquery={handleQuery}
					onattendance={handleAttendance}
					onadd={addRow}
					ondensity={handleDensity}
					oninsertabove={insertAbove}
					oninsertbelow={insertBelow}
					ondelete={removeRow}
					onedit={editCell}
					onpage={handlePage}
					onlimit={handleLimit}
					onreload={() => loadList()}
				/>
			{:else}
				<h2>Ringkasan</h2>
				<ul class="summary">
					<li><strong>{sumMsgs}</strong><span>Pesan masuk</span></li>
					<li><strong>{sumRsvps}</strong><span>Entri RSVP</span></li>
					<li><strong>{sumTamu}</strong><span>Total tamu</span></li>
					<li><strong>{sumHadir}</strong><span>Hadir</span></li>
					<li><strong>{sumAbsen}</strong><span>Berhalangan</span></li>
				</ul>
			{/if}
		</div>

		<AdminNav active={tab} onselect={(t) => { selectTab(t) }} />
	{/if}
</section>

<style>
	.admin {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
		padding: var(--spacing-section) var(--spacing-card);
		padding-bottom: calc(var(--spacing-section) + var(--size-touch-target) + var(--spacing-m));
	}

	.tab-panel {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
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
		font-variant-numeric: tabular-nums;
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

	.summary {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.summary li {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--spacing-s);
		padding: var(--spacing-s);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
	}

	.summary strong {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
		font-variant-numeric: tabular-nums;
	}

	.summary span {
		color: var(--color-text-weak);
		font-size: var(--text-body);
	}

	.error, .hint {
		font-size: var(--text-body);
	}
</style>
