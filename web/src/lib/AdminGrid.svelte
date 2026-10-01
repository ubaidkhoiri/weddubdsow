<script lang="ts">
	export type GridColumn = { key: string, label: string, width: number, sortable: boolean }
	export type GridDensity = "rapat" | "nyaman"

	export const defaultGridColumns: Array<GridColumn> = [
		{ key: "name", label: "Nama", width: 160, sortable: true },
		{ key: "created_at", label: "Waktu", width: 190, sortable: true }
	]

	type Editing = { id: string, key: string, draft: string, error: string }

	let {
		dataset,
		columns,
		rows,
		total = 0,
		loading = false,
		error = "",
		query = "",
		attendance = "",
		showAttendance = false,
		density = "nyaman",
		editableKeys = [],
		page = 1,
		pageCount = 1,
		limit = 20,
		emptyLabel = "Belum ada data.",
		onquery,
		onattendance,
		onadd,
		ondensity,
		oninsertabove,
		oninsertbelow,
		ondelete,
		onedit,
		onpage,
		onlimit,
		onreload
	}: {
		dataset: string
		columns: Array<GridColumn>
		rows: Array<Record<string, unknown>>
		total?: number
		loading?: boolean
		error?: string
		query?: string
		attendance?: string
		showAttendance?: boolean
		density?: GridDensity
		editableKeys?: Array<string>
		page?: number
		pageCount?: number
		limit?: number
		emptyLabel?: string
		onquery: (value: string) => void
		onattendance: (value: string) => void
		onadd: () => void
		ondensity: (value: GridDensity) => void
		oninsertabove: (id: string) => void
		oninsertbelow: (id: string) => void
		ondelete: (id: string) => void
		onedit: (id: string, key: string, value: unknown) => void
		onpage: (value: number) => void
		onlimit: (value: number) => void
		onreload: () => void
	} = $props()

	let sortKey = $state("")
	let sortDir = $state<1 | -1>(1)
	let order = $state<Array<string> | null>(null)
	let hidden = $state<Array<string>>([])
	let widths = $state<Record<string, number>>({})
	let editing = $state<Editing | null>(null)
	let confirmId = $state<string | null>(null)
	let dialog = $state<HTMLDialogElement | null>(null)
	let prefsReady = $state(false)

	function prefsKey() {
		return "weddu-admin-grid:" + dataset
	}

	function loadPrefs() {
		if (typeof localStorage === "undefined") return
		try {
			const raw = localStorage.getItem(prefsKey())
			if (!raw) return
			const parsed = JSON.parse(raw) as { order?: Array<string>, hidden?: Array<string>, widths?: Record<string, number> }
			const keys = columns.map((c) => c.key)
			if (Array.isArray(parsed.order) && parsed.order.length > 0) {
				const kept = parsed.order.filter((k) => keys.includes(k))
				const missing = keys.filter((k) => !kept.includes(k))
				order = [...kept, ...missing]
			}
			if (Array.isArray(parsed.hidden)) hidden = parsed.hidden.filter((k) => keys.includes(k))
			if (parsed.widths && typeof parsed.widths === "object") {
				const next: Record<string, number> = {}
				for (const k of keys) {
					const w = parsed.widths[k]
					if (typeof w === "number" && Number.isFinite(w)) next[k] = Math.min(480, Math.max(64, w))
				}
				widths = next
			}
		} catch {
			order = null
			hidden = []
			widths = {}
		}
	}

	function savePrefs() {
		if (!prefsReady || typeof localStorage === "undefined") return
		try {
			localStorage.setItem(prefsKey(), JSON.stringify({ order, hidden, widths }))
		} catch {
			// abaikan kuota penuh
		}
	}

	$effect(() => {
		loadPrefs()
		prefsReady = true
	})

	$effect(() => {
		if (!prefsReady) return
		savePrefs()
	})

	$effect(() => {
		if (confirmId && dialog && !dialog.open) dialog.showModal()
		if (!confirmId && dialog && dialog.open) dialog.close()
	})

	let baseOrder = $derived(columns.map((c) => c.key))
	let activeOrder = $derived(order ?? baseOrder)
	let visibleColumns = $derived(
		activeOrder
			.map((k) => columns.find((c) => c.key === k))
			.filter((c) => c !== undefined && !hidden.includes(c.key))
	)
	let hasFilter = $derived(query.trim() !== "" || attendance !== "")
	let shownCount = $derived(rows.length)
	let resultText = $derived(
		loading
			? "Memuat data…"
			: error
				? "Gagal memuat data."
				: "Menampilkan " + shownCount + " dari " + total + " baris."
	)

	function widthOf(key: string, fallback: number) {
		return widths[key] ?? fallback
	}

	function toggleSort(key: string) {
		if (sortKey === key) sortDir = sortDir === 1 ? -1 : 1
		else {
			sortKey = key
			sortDir = 1
		}
	}

	function sortAria(key: string) {
		if (sortKey !== key) return "none" as const
		return sortDir === 1 ? ("ascending" as const) : ("descending" as const)
	}

	let sortedRows = $derived.by(() => {
		if (sortKey === "") return rows
		const copy = [...rows]
		copy.sort((a, b) => {
			const av = a[sortKey]
			const bv = b[sortKey]
			if (typeof av === "number" && typeof bv === "number") return (av - bv) * sortDir
			const as = String(av ?? "")
			const bs = String(bv ?? "")
			return as.localeCompare(bs, "id") * sortDir
		})
		return copy
	})

	function moveColumn(key: string, delta: -1 | 1) {
		const next = [...activeOrder]
		const i = next.indexOf(key)
		const j = i + delta
		if (i < 0 || j < 0 || j >= next.length) return
		const tmp = next[i]
		next[i] = next[j]
		next[j] = tmp
		order = next
		savePrefs()
	}

	function hideColumn(key: string) {
		if (!hidden.includes(key)) hidden = [...hidden, key]
		savePrefs()
	}

	function showAllColumns() {
		hidden = []
		savePrefs()
	}

	function nudgeWidth(key: string, delta: number, fallback: number) {
		const next = Math.min(480, Math.max(64, widthOf(key, fallback) + delta))
		widths = { ...widths, [key]: next }
		savePrefs()
	}

	function gripDown(e: MouseEvent, key: string, fallback: number) {
		const startX = e.clientX
		const startW = widthOf(key, fallback)
		const onMove = (ev: MouseEvent) => {
			const next = Math.min(480, Math.max(64, startW + ev.clientX - startX))
			widths = { ...widths, [key]: next }
		}
		const onUp = () => {
			window.removeEventListener("mousemove", onMove)
			window.removeEventListener("mouseup", onUp)
			savePrefs()
		}
		window.addEventListener("mousemove", onMove)
		window.addEventListener("mouseup", onUp)
	}

	function attendanceText(value: unknown) {
		if (value === "yes") return "Hadir"
		if (value === "no") return "Berhalangan"
		if (value === "maybe") return "Mungkin"
		return String(value ?? "")
	}

	function cellText(row: Record<string, unknown>, key: string) {
		const value = row[key]
		if (key === "attendance") return attendanceText(value)
		if (value === null || value === undefined) return "—"
		return String(value)
	}

	function formatTime(iso: unknown) {
		if (typeof iso !== "string" || iso === "") return "—"
		const d = new Date(iso)
		if (Number.isNaN(d.getTime())) return iso
		return new Intl.DateTimeFormat("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		}).format(d)
	}

	function isTimeKey(key: string) {
		return key === "created_at"
	}

	function startEdit(id: string, key: string, current: unknown) {
		editing = { id, key, draft: current === null || current === undefined ? "" : String(current), error: "" }
	}

	function cancelEdit() {
		editing = null
	}

	function maxName() {
		return dataset === "pesan" ? 60 : 120
	}

	function validateCell(key: string, raw: string): { value: unknown } | { error: string } {
		const text = raw.trim()
		if (key === "name") {
			if (text === "") return { error: "Nama wajib diisi." }
			if (text.length > maxName()) return { error: "Nama maksimal " + maxName() + " karakter." }
			return { value: text }
		}
		if (key === "message") {
			if (text === "") return { error: "Pesan wajib diisi." }
			if (text.length > 500) return { error: "Pesan maksimal 500 karakter." }
			return { value: text }
		}
		if (key === "attendance") {
			if (text !== "yes" && text !== "no" && text !== "maybe") return { error: "Kehadiran harus yes, no, atau maybe." }
			return { value: text }
		}
		if (key === "guests") {
			const n = Number.parseInt(text, 10)
			if (!Number.isInteger(n) || n < 1 || n > 5) return { error: "Tamu harus bilangan 1 sampai 5." }
			return { value: n }
		}
		if (key === "phone") {
			if (text === "") return { value: null }
			if (text.length > 20) return { error: "Telepon maksimal 20 karakter." }
			return { value: text }
		}
		return { value: text }
	}

	function saveEdit() {
		if (!editing) return
		const check = validateCell(editing.key, editing.draft)
		if ("error" in check) {
			editing = { ...editing, error: check.error }
			return
		}
		const target = { ...editing }
		editing = null
		onedit(target.id, target.key, check.value)
	}

	function exportCsv() {
		const head = visibleColumns.map((c) => c.label)
		const lines = sortedRows.map((row) =>
			visibleColumns.map((c) => {
				const raw = row[c.key]
				const text = raw === null || raw === undefined ? "" : String(raw)
				return "\"" + text.replaceAll("\"", "\"\"") + "\""
			}).join(",")
		)
		const csv = [head.join(","), ...lines].join("\n")
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "admin-" + dataset + ".csv"
		document.body.appendChild(a)
		a.click()
		a.remove()
		setTimeout(() => URL.revokeObjectURL(url), 1000)
	}

	function rowName(row: Record<string, unknown>) {
		return String(row.name ?? row.id ?? "baris")
	}
</script>

<div class="grid" data-density={density}>
	<div class="toolbar" role="toolbar" aria-label="Bilah alat data">
		<label class="search">
			<span>Cari</span>
			<input
				type="search"
				value={query}
				placeholder="Cari nama…"
				oninput={(e) => onquery(e.currentTarget.value)}
			/>
		</label>
		{#if showAttendance}
			<label class="filter">
				<span>Kehadiran</span>
				<select value={attendance} onchange={(e) => onattendance(e.currentTarget.value)}>
					<option value="">Semua</option>
					<option value="yes">Hadir</option>
					<option value="no">Berhalangan</option>
					<option value="maybe">Mungkin</option>
				</select>
			</label>
		{/if}
		<div class="tools">
			<button type="button" onclick={exportCsv} disabled={rows.length === 0}>Ekspor CSV</button>
			<button type="button" onclick={onadd}>Tambah baris</button>
		</div>
		<div class="density" role="group" aria-label="Tinggi baris">
			<button type="button" aria-pressed={density === "rapat"} onclick={() => ondensity("rapat")}>Rapat</button>
			<button type="button" aria-pressed={density === "nyaman"} onclick={() => ondensity("nyaman")}>Nyaman</button>
		</div>
	</div>

	<p class="live" role="status" aria-live="polite">{resultText}</p>

	{#if hidden.length > 0}
		<p class="hidden-note">
			{hidden.length} kolom disembunyikan.
			<button type="button" onclick={showAllColumns}>Tampilkan semua</button>
		</p>
	{/if}

	{#if error}
		<div class="state" role="alert">
			<p>{error}</p>
			<button type="button" onclick={onreload}>Coba lagi</button>
		</div>
	{:else if loading}
		<p class="state" aria-busy="true">Memuat data…</p>
	{:else if rows.length === 0 && !hasFilter}
		<p class="state">{emptyLabel} Tambah baris pertama lewat tombol Tambah.</p>
	{:else if rows.length === 0}
		<p class="state">Tidak ada hasil untuk pencarian ini. Ubah kata kunci atau saring.</p>
	{:else}
		<div class="scroller" role="region" aria-label="Tabel data {dataset}">
			<table>
				<colgroup>
					{#each visibleColumns as c (c.key)}
						<col style="width: {widthOf(c.key, c.width)}px" />
					{/each}
					<col class="col-act" />
				</colgroup>
				<thead>
					<tr>
						{#each visibleColumns as c (c.key)}
							<th scope="col" aria-sort={c.sortable ? sortAria(c.key) : undefined}>
								<div class="hcell">
									{#if c.sortable}
										<button
											type="button"
											class="sort"
											aria-label={sortKey === c.key && sortDir === -1 ? "Urut " + c.label + " menaik" : "Urut " + c.label + " menurun"}
											onclick={() => toggleSort(c.key)}
										>{c.label} {sortKey === c.key ? (sortDir === 1 ? "↑" : "↓") : ""}</button>
									{:else}
										<span class="head-label">{c.label}</span>
									{/if}
									<details class="colmenu">
										<summary aria-label={"Menu kolom " + c.label}>⋯</summary>
										<div class="menu">
											<button type="button" onclick={() => moveColumn(c.key, -1)}>Pindah kiri</button>
											<button type="button" onclick={() => moveColumn(c.key, 1)}>Pindah kanan</button>
											<button type="button" onclick={() => hideColumn(c.key)}>Sembunyikan</button>
										</div>
									</details>
									<button
										type="button"
										class="grip"
										aria-label={"Ubah lebar kolom " + c.label + ". Panah kiri kanan untuk ubah."}
										onkeydown={(e) => {
											if (e.key === "ArrowLeft") nudgeWidth(c.key, -12, c.width)
											if (e.key === "ArrowRight") nudgeWidth(c.key, 12, c.width)
										}}
										onmousedown={(e) => gripDown(e, c.key, c.width)}
									>⋮</button>
								</div>
							</th>
						{/each}
						<th scope="col"><span class="head-label">Aksi</span></th>
					</tr>
				</thead>
				<tbody>
					{#each sortedRows as row (String(row.id))}
						{@const rid = String(row.id)}
						<tr>
							{#each visibleColumns as c (c.key)}
								<td data-num={typeof row[c.key] === "number" ? "true" : undefined}>
									{#if editing && editing.id === rid && editing.key === c.key}
										<div class="edit">
											{#if c.key === "attendance"}
												<select value={editing.draft} onchange={(e) => { editing = editing ? { ...editing, draft: e.currentTarget.value } : editing }}>
													<option value="yes">Hadir</option>
													<option value="no">Berhalangan</option>
													<option value="maybe">Mungkin</option>
												</select>
											{:else}
												<input
													value={editing.draft}
													inputmode={c.key === "guests" ? "numeric" : undefined}
													aria-label={"Ubah " + c.label}
													oninput={(e) => { editing = editing ? { ...editing, draft: e.currentTarget.value } : editing }}
													onkeydown={(e) => { if (e.key === "Enter") saveEdit() }}
												/>
											{/if}
											{#if editing.error}
												<p class="edit-error" role="alert">{editing.error}</p>
											{/if}
											<div class="edit-btns">
												<button type="button" onclick={saveEdit}>Simpan</button>
												<button type="button" onclick={cancelEdit}>Batal</button>
											</div>
										</div>
									{:else if isTimeKey(c.key)}
										<time datetime={typeof row[c.key] === "string" ? row[c.key] : undefined}>{formatTime(row[c.key])}</time>
									{:else}
										<span class="cell-val">{cellText(row, c.key)}</span>
										{#if editableKeys.includes(c.key)}
											<button type="button" class="mini" aria-label={"Ubah " + c.label + " " + rowName(row)} onclick={() => startEdit(rid, c.key, row[c.key])}>Ubah</button>
										{/if}
									{/if}
								</td>
							{/each}
							<td>
								<div class="rowact">
									<button type="button" aria-label={"Sisip di atas " + rowName(row)} onclick={() => oninsertabove(rid)}>↑ Atas</button>
									<button type="button" aria-label={"Sisip di bawah " + rowName(row)} onclick={() => oninsertbelow(rid)}>↓ Bawah</button>
									<button type="button" class="danger" aria-label={"Hapus " + rowName(row)} onclick={() => { confirmId = rid }}>Hapus</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="pager">
			<button type="button" disabled={page <= 1} onclick={() => onpage(page - 1)}>Sebelumnya</button>
			<span>Halaman {page} dari {pageCount}</span>
			<button type="button" disabled={page >= pageCount} onclick={() => onpage(page + 1)}>Berikutnya</button>
			<label>Baris
				<select value={limit} onchange={(e) => onlimit(Number.parseInt(e.currentTarget.value, 10))}>
					<option value="10">10</option>
					<option value="20">20</option>
					<option value="50">50</option>
				</select>
			</label>
		</div>
	{/if}

	<dialog bind:this={dialog} aria-label="Konfirmasi hapus" onclose={() => { confirmId = null }}>
		<h3>Hapus baris?</h3>
		<p>Tindakan ini tidak bisa dibatalkan.</p>
		<div class="dlg-btns">
			<button type="button" onclick={() => { confirmId = null }}>Batal</button>
			<button
				type="button"
				class="danger-solid"
				onclick={() => {
					const target = confirmId
					confirmId = null
					if (target) ondelete(target)
				}}
			>Hapus</button>
		</div>
	</dialog>
</div>

<style>
	.grid {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		font-variant-numeric: tabular-nums;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
	}

	.search, .filter {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-label);
		font-size: var(--text-caption);
		color: var(--color-text-weak);
	}

	.search input, .filter select {
		min-height: var(--size-touch-target);
		padding: var(--spacing-2xs) var(--spacing-xs);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
		font-size: var(--text-body);
		max-width: 12rem;
	}

	.tools, .density {
		display: flex;
		gap: var(--spacing-2xs);
		align-items: center;
	}

	.grid button {
		min-height: var(--size-touch-target);
		padding: var(--spacing-2xs) var(--spacing-xs);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
		font-size: var(--text-body);
		cursor: pointer;
	}

	.grid button:disabled {
		opacity: var(--opacity-disabled);
		cursor: default;
	}

	.grid button[aria-pressed="true"] {
		background: var(--color-text-strong);
		color: var(--color-bg-base);
	}

	.grid button:focus-visible, .grid input:focus-visible, .grid select:focus-visible, .grid summary:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus);
		outline-offset: var(--focus-ring-offset);
	}

	.live, .hidden-note {
		margin: 0;
		font-size: var(--text-caption);
		color: var(--color-text-weak);
	}

	.state {
		margin: 0;
		padding: var(--spacing-s);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
		color: var(--color-text-weak);
		font-size: var(--text-body);
	}

	.scroller {
		overflow: auto;
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
	}

	table {
		border-collapse: collapse;
		width: 100%;
		table-layout: fixed;
	}

	th, td {
		text-align: left;
		vertical-align: middle;
		padding: var(--spacing-2xs) var(--spacing-xs);
		border-bottom: var(--border-width-hairline) solid var(--color-stroke-weak);
		font-size: var(--text-body);
		color: var(--color-text-strong);
		overflow: hidden;
	}

	.grid[data-density="rapat"] td {
		min-height: var(--size-control-sm);
	}

	.grid[data-density="nyaman"] td {
		min-height: var(--size-row);
	}

	td[data-num] {
		font-variant-numeric: tabular-nums;
	}

	time {
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.hcell {
		display: flex;
		align-items: center;
		gap: var(--spacing-2xs);
	}

	.sort {
		flex: 1;
		text-align: left;
		border: 0;
		background: none;
		font-weight: var(--font-weight-bold);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.head-label {
		font-weight: var(--font-weight-bold);
	}

	.colmenu summary {
		list-style: none;
		cursor: pointer;
		min-height: var(--size-touch-target);
		display: inline-flex;
		align-items: center;
		padding: 0 var(--spacing-2xs);
		border-radius: var(--radius-control);
	}

	.colmenu .menu {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
		padding: var(--spacing-2xs);
	}

	.grip {
		cursor: col-resize;
		border: 0;
		background: none;
		color: var(--color-text-weak);
		touch-action: none;
	}

	.cell-val {
		margin-right: var(--spacing-2xs);
		overflow-wrap: anywhere;
	}

	.mini {
		border: 0;
		background: none;
		text-decoration: underline;
		padding: 0;
	}

	.rowact {
		display: flex;
		gap: var(--spacing-2xs);
		flex-wrap: wrap;
	}

	.danger {
		color: var(--color-text-error);
	}

	.edit {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
	}

	.edit input, .edit select {
		min-height: var(--size-touch-target);
		padding: var(--spacing-2xs) var(--spacing-xs);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
		font-size: var(--text-body);
		width: 100%;
	}

	.edit-error {
		margin: 0;
		color: var(--color-text-error);
		font-size: var(--text-caption);
	}

	.edit-btns {
		display: flex;
		gap: var(--spacing-2xs);
	}

	.pager {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: var(--text-caption);
		color: var(--color-text-weak);
	}

	.pager select {
		min-height: var(--size-touch-target);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
	}

	dialog {
		width: min(92vw, 28rem);
		padding: var(--spacing-m);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-overlay);
		color: var(--color-text-strong);
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 40%);
	}

	dialog h3 {
		margin: 0 0 var(--spacing-xs);
		font-size: var(--text-h3);
	}

	dialog p {
		margin: 0 0 var(--spacing-s);
		color: var(--color-text-weak);
	}

	.dlg-btns {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-xs);
	}

	.danger-solid {
		background: var(--color-text-error);
		color: var(--color-bg-base);
		border: 0;
	}
</style>
