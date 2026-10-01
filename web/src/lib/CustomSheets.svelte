<script lang="ts">
	type Sheet = { id: string, name: string, cells: Array<Array<string>> }

	const STORE_KEY = "weddu-admin-sheets"
	const COLS_DEFAULT = 8
	const ROWS_DEFAULT = 15
	const MAX_COLS = 26
	const MAX_ROWS = 50
	const MAX_NAME = 60
	const MAX_CELL = 500
	const SAVE_DELAY = 350

	let sheets = $state<Array<Sheet>>([])
	let activeId = $state<string | null>(null)
	let sel = $state<{ r: number, c: number }>({ r: 0, c: 0 })
	let loaded = $state(false)
	let saveError = $state("")
	let renameId = $state<string | null>(null)
	let renameDraft = $state("")
	let renameError = $state("")
	let confirmId = $state<string | null>(null)
	let dialog = $state<HTMLDialogElement | null>(null)
	let newName = $state("")
	let timer: ReturnType<typeof setTimeout> | null = null

	let active = $derived(sheets.find((s) => s.id === activeId) ?? null)
	let colCount = $derived(active ? active.cells[0].length : 0)
	let rowCount = $derived(active ? active.cells.length : 0)
	let isEmpty = $derived(active ? active.cells.every((row) => row.every((v) => v.trim() === "")) : true)
	let statusText = $derived(
		!loaded
			? "Memuat sheet…"
			: saveError !== ""
				? "Gagal menyimpan sheet."
				: sheets.length === 0
					? "Belum ada sheet."
					: "Sheet " + (active?.name ?? "") + ", " + colCount + " kolom, " + rowCount + " baris."
	)

	function blankGrid(cols: number, rows: number): Array<Array<string>> {
		return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""))
	}

	function uid() {
		return "sh-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 10000).toString(36)
	}

	function colLabel(i: number) {
		return String.fromCharCode(65 + i)
	}

	function load() {
		if (typeof localStorage === "undefined") return
		try {
			const raw = localStorage.getItem(STORE_KEY)
			if (!raw) {
				sheets = [{ id: uid(), name: "Sheet 1", cells: blankGrid(COLS_DEFAULT, ROWS_DEFAULT) }]
				activeId = sheets[0].id
				return
			}
			const parsed = JSON.parse(raw) as { sheets?: Array<Sheet>, activeId?: string }
			if (!Array.isArray(parsed.sheets) || parsed.sheets.length === 0) {
				sheets = [{ id: uid(), name: "Sheet 1", cells: blankGrid(COLS_DEFAULT, ROWS_DEFAULT) }]
				activeId = sheets[0].id
				return
			}
			sheets = parsed.sheets
				.filter((s) => s && typeof s.id === "string" && typeof s.name === "string" && Array.isArray(s.cells))
				.map((s) => ({
					id: s.id,
					name: s.name.slice(0, MAX_NAME),
					cells: normalizeCells(s.cells)
				}))
			if (sheets.length === 0) {
				sheets = [{ id: uid(), name: "Sheet 1", cells: blankGrid(COLS_DEFAULT, ROWS_DEFAULT) }]
			}
			activeId = sheets.some((s) => s.id === parsed.activeId) ? (parsed.activeId as string) : sheets[0].id
		} catch {
			sheets = [{ id: uid(), name: "Sheet 1", cells: blankGrid(COLS_DEFAULT, ROWS_DEFAULT) }]
			activeId = sheets[0].id
		}
	}

	function normalizeCells(cells: Array<Array<string>>): Array<Array<string>> {
		const cols = Math.min(MAX_COLS, Math.max(1, Math.max(...cells.map((r) => (Array.isArray(r) ? r.length : 0)), COLS_DEFAULT)))
		const rows = Math.min(MAX_ROWS, Math.max(1, cells.length))
		const out = blankGrid(cols, rows)
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const v = Array.isArray(cells[r]) ? cells[r][c] : ""
				out[r][c] = typeof v === "string" ? v.slice(0, MAX_CELL) : String(v ?? "").slice(0, MAX_CELL)
			}
		}
		return out
	}

	function persist() {
		if (!loaded || typeof localStorage === "undefined") return
		try {
			localStorage.setItem(STORE_KEY, JSON.stringify({ sheets, activeId }))
			saveError = ""
		} catch {
			saveError = "Penyimpanan penuh, perubahan belum tersimpan."
		}
	}

	function scheduleSave() {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			timer = null
			persist()
		}, SAVE_DELAY)
	}

	function setCell(r: number, c: number, value: string) {
		if (!active) return
		active.cells[r][c] = value.slice(0, MAX_CELL)
		sel = { r, c }
		scheduleSave()
	}

	function clampSel() {
		if (!active) return
		sel = {
			r: Math.min(Math.max(0, sel.r), active.cells.length - 1),
			c: Math.min(Math.max(0, sel.c), active.cells[0].length - 1)
		}
	}

	function addSheet() {
		const name = newName.trim() === "" ? "Sheet " + (sheets.length + 1) : newName.trim().slice(0, MAX_NAME)
		const sheet: Sheet = { id: uid(), name, cells: blankGrid(COLS_DEFAULT, ROWS_DEFAULT) }
		sheets = [...sheets, sheet]
		activeId = sheet.id
		sel = { r: 0, c: 0 }
		newName = ""
		persist()
	}

	function startRename(id: string, current: string) {
		renameId = id
		renameDraft = current
		renameError = ""
	}

	function commitRename() {
		if (!renameId) return
		const text = renameDraft.trim()
		if (text === "") {
			renameError = "Nama sheet wajib diisi."
			return
		}
		if (text.length > MAX_NAME) {
			renameError = "Nama maksimal " + MAX_NAME + " karakter."
			return
		}
		sheets = sheets.map((s) => (s.id === renameId ? { ...s, name: text } : s))
		renameId = null
		renameDraft = ""
		renameError = ""
		persist()
	}

	function requestDelete(id: string) {
		confirmId = id
	}

	function confirmDelete() {
		if (!confirmId) return
		const target = confirmId
		confirmId = null
		sheets = sheets.filter((s) => s.id !== target)
		if (renameId === target) renameId = null
		if (activeId === target) {
			activeId = sheets.length > 0 ? sheets[0].id : null
			sel = { r: 0, c: 0 }
		}
		persist()
	}

	function selectSheet(id: string) {
		activeId = id
		sel = { r: 0, c: 0 }
		persist()
	}

	function addCol() {
		if (!active || active.cells[0].length >= MAX_COLS) return
		for (const row of active.cells) row.push("")
		scheduleSave()
	}

	function insertCol(index: number) {
		if (!active || active.cells[0].length >= MAX_COLS) return
		for (const row of active.cells) row.splice(index, 0, "")
		clampSel()
		scheduleSave()
	}

	function deleteCol(index: number) {
		if (!active || active.cells[0].length <= 1) return
		for (const row of active.cells) row.splice(index, 1)
		clampSel()
		scheduleSave()
	}

	function addRow() {
		if (!active || active.cells.length >= MAX_ROWS) return
		active.cells.push(Array.from({ length: active.cells[0].length }, () => ""))
		scheduleSave()
	}

	function insertRow(index: number) {
		if (!active || active.cells.length >= MAX_ROWS) return
		active.cells.splice(index, 0, Array.from({ length: active.cells[0].length }, () => ""))
		clampSel()
		scheduleSave()
	}

	function deleteRow(index: number) {
		if (!active || active.cells.length <= 1) return
		active.cells.splice(index, 1)
		clampSel()
		scheduleSave()
	}

	function retrySave() {
		persist()
	}

	function exportCsv() {
		if (!active) return
		const lines = active.cells.map((row) =>
			row.map((v) => "\"" + v.replaceAll("\"", "\"\"") + "\"").join(",")
		)
		const head = active.cells[0].map((_, i) => colLabel(i)).join(",")
		const csv = [head, ...lines].join("\n")
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "sheet-" + active.name.replaceAll(" ", "-").toLowerCase() + ".csv"
		document.body.appendChild(a)
		a.click()
		a.remove()
		setTimeout(() => URL.revokeObjectURL(url), 1000)
	}

	function deleteName() {
		return sheets.find((s) => s.id === confirmId)?.name ?? "sheet"
	}

	$effect(() => {
		load()
		loaded = true
	})

	$effect(() => {
		if (confirmId && dialog && !dialog.open) dialog.showModal()
		if (!confirmId && dialog && dialog.open) dialog.close()
	})
</script>

<div class="sheets" data-density="nyaman">
	<div class="toolbar" role="toolbar" aria-label="Bilah alat sheet">
		<label class="search">
			<span>Sheet baru</span>
			<input
				type="text"
				value={newName}
				maxlength={MAX_NAME}
				placeholder="Nama sheet…"
				oninput={(e) => { newName = e.currentTarget.value }}
				onkeydown={(e) => { if (e.key === "Enter") addSheet() }}
			/>
		</label>
		<div class="tools">
			<button type="button" onclick={addSheet}>Tambah sheet</button>
			<button type="button" onclick={exportCsv} disabled={!active || isEmpty}>Ekspor CSV</button>
		</div>
		<div class="tools">
			<button type="button" onclick={addCol} disabled={!active || colCount >= MAX_COLS}>Tambah kolom</button>
			<button type="button" onclick={addRow} disabled={!active || rowCount >= MAX_ROWS}>Tambah baris</button>
		</div>
	</div>

	<p class="live" role="status" aria-live="polite">{statusText}</p>

	{#if saveError}
		<div class="state" role="alert">
			<p>{saveError}</p>
			<div class="edit-btns">
				<button type="button" onclick={retrySave}>Coba lagi</button>
				<button type="button" onclick={() => { saveError = "" }}>Tutup</button>
			</div>
		</div>
	{/if}

	{#if sheets.length === 0}
		<p class="state">Belum ada sheet. Buat sheet pertama untuk mulai mencatat.</p>
		<div class="tools">
			<button type="button" onclick={addSheet}>Buat sheet pertama</button>
		</div>
	{:else}
		<div class="sheetlist" role="tablist" aria-label="Daftar sheet">
			{#each sheets as s (s.id)}
				<div class="sheetitem" role="tab" aria-selected={s.id === activeId}>
					{#if renameId === s.id}
						<div class="edit">
							<input
								value={renameDraft}
								maxlength={MAX_NAME}
								aria-label="Ganti nama sheet"
								oninput={(e) => { renameDraft = e.currentTarget.value }}
								onkeydown={(e) => { if (e.key === "Enter") commitRename() }}
							/>
							{#if renameError}
								<p class="edit-error" role="alert">{renameError}</p>
							{/if}
							<div class="edit-btns">
								<button type="button" onclick={commitRename}>Simpan</button>
								<button type="button" onclick={() => { renameId = null }}>Batal</button>
							</div>
						</div>
					{:else}
						<button
							type="button"
							class="sheetname"
							aria-current={s.id === activeId ? "page" : undefined}
							onclick={() => selectSheet(s.id)}
						>{s.name}</button>
						<div class="rowact">
							<button type="button" class="mini" aria-label={"Ganti nama " + s.name} onclick={() => startRename(s.id, s.name)}>Ganti nama</button>
							<button type="button" class="mini danger" aria-label={"Hapus " + s.name} onclick={() => requestDelete(s.id)}>Hapus</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		{#if active && isEmpty}
			<p class="state">Sheet masih kosong. Klik sel lalu ketik untuk mengisi.</p>
		{/if}

		{#if active}
			<div class="scroller" role="region" aria-label={"Grid " + active.name}>
				<table>
					<thead>
						<tr>
							<th scope="col"><span class="head-label">A1</span></th>
							{#each active.cells[0] as _, c (c)}
								<th scope="col">
									<div class="hcell">
										<span class="head-label">{colLabel(c)}</span>
										<details class="colmenu">
											<summary aria-label={"Menu kolom " + colLabel(c)}>⋯</summary>
											<div class="menu">
												<button type="button" onclick={() => insertCol(c)}>Sisip kiri</button>
												<button type="button" onclick={() => insertCol(c + 1)}>Sisip kanan</button>
												<button type="button" onclick={() => deleteCol(c)}>Hapus kolom</button>
											</div>
										</details>
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each active.cells as row, r (r)}
							<tr>
								<th scope="row">
									<div class="hcell">
										<span class="head-label">{r + 1}</span>
										<details class="colmenu">
											<summary aria-label={"Menu baris " + (r + 1)}>⋯</summary>
											<div class="menu">
												<button type="button" onclick={() => insertRow(r)}>Sisip atas</button>
												<button type="button" onclick={() => insertRow(r + 1)}>Sisip bawah</button>
												<button type="button" onclick={() => deleteRow(r)}>Hapus baris</button>
											</div>
										</details>
									</div>
								</th>
								{#each row as val, c (c)}
									<td data-sel={sel.r === r && sel.c === c ? "true" : undefined}>
										<input
											value={val}
											maxlength={MAX_CELL}
											aria-label={"Sel " + colLabel(c) + (r + 1)}
											onfocus={() => { sel = { r, c } }}
											onclick={() => { sel = { r, c } }}
											oninput={(e) => setCell(r, c, e.currentTarget.value)}
										/>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}

	<dialog bind:this={dialog} aria-label="Konfirmasi hapus" onclose={() => { confirmId = null }}>
		<h3>Hapus sheet?</h3>
		<p>{deleteName()} akan dihapus dan tidak bisa dibatalkan.</p>
		<div class="dlg-btns">
			<button type="button" onclick={() => { confirmId = null }}>Batal</button>
			<button type="button" class="danger-solid" onclick={confirmDelete}>Hapus</button>
		</div>
	</dialog>
</div>

<style>
	.sheets {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
		font-variant-numeric: tabular-nums;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--spacing-2xs);
		padding: var(--spacing-2xs);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
	}

	.search {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-label);
		font-size: var(--text-caption);
		color: var(--color-text-weak);
	}

	.search input {
		min-height: var(--size-touch-target);
		padding: var(--spacing-2xs) var(--spacing-xs);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
		font-size: var(--text-body);
		max-width: 12rem;
	}

	.tools {
		display: flex;
		gap: var(--spacing-2xs);
		align-items: center;
		flex-wrap: wrap;
	}

	.sheets button {
		min-height: var(--size-touch-target);
		padding: var(--spacing-2xs) var(--spacing-xs);
		border: var(--border-width-hairline) solid var(--color-stroke-strong);
		border-radius: var(--radius-control);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
		font-size: var(--text-caption);
		cursor: pointer;
	}

	.sheets button:disabled {
		opacity: var(--opacity-disabled);
		cursor: default;
	}

	.sheets button:focus-visible, .sheets input:focus-visible, .sheets summary:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus);
		outline-offset: var(--focus-ring-offset);
	}

	.live {
		margin: 0;
		font-size: var(--text-caption);
		color: var(--color-text-weak);
	}

	.state {
		margin: 0;
		padding: var(--spacing-xs);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
		color: var(--color-text-weak);
		font-size: var(--text-caption);
	}

	.sheetlist {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
	}

	.sheetitem {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-2xs);
		padding: var(--spacing-2xs) var(--spacing-2xs);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-raised);
	}

	.sheetitem[aria-selected="true"] {
		border-color: var(--color-stroke-strong);
	}

	.sheetname {
		flex: 1;
		text-align: left;
		font-weight: var(--font-weight-bold);
	}

	.rowact {
		display: flex;
		gap: var(--spacing-2xs);
		flex-wrap: wrap;
	}

	.mini {
		border: 0;
		background: none;
		text-decoration: underline;
		padding: 0;
	}

	.danger {
		color: var(--color-text-error);
	}

	.edit {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
		flex: 1;
	}

	.edit input {
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
		padding: var(--spacing-2xs) var(--spacing-2xs);
		border-bottom: var(--border-width-hairline) solid var(--color-stroke-weak);
		font-size: var(--text-caption);
		color: var(--color-text-strong);
		overflow: hidden;
		min-height: var(--size-row);
	}

	td[data-sel] {
		border-bottom: var(--border-width-hairline) solid var(--color-stroke-strong);
	}

	td input {
		width: 100%;
		min-height: var(--size-control-sm);
		padding: var(--spacing-2xs) var(--spacing-2xs);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-control);
		background: var(--color-bg-base);
		color: var(--color-text-strong);
		font-size: var(--text-body);
	}

	.hcell {
		display: flex;
		align-items: center;
		gap: var(--spacing-2xs);
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

	dialog {
		width: min(92vw, 28rem);
		padding: var(--spacing-s);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		background: var(--color-bg-overlay);
		color: var(--color-text-strong);
	}

	dialog::backdrop {
		background: var(--color-state-press);
	}

	dialog h3 {
		margin: 0 0 var(--spacing-2xs);
		font-size: var(--text-lead);
	}

	dialog p {
		margin: 0 0 var(--spacing-xs);
		color: var(--color-text-weak);
	}

	.dlg-btns {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-2xs);
	}

	.danger-solid {
		background: var(--color-text-error);
		color: var(--color-bg-base);
		border: 0;
	}
</style>
