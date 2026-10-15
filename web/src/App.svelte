<script lang="ts">
	import { onMount } from "svelte";
	import V1App from "./v1/V1App.svelte";
	import V2App from "./v2/V2App.svelte";
	import { getActiveVersion, type ActiveVersion } from "./lib/api";

	let version = $state<ActiveVersion>("v2");
	let ready = $state(false);
	let isAdmin = $state(false);

	function syncAdmin() {
		isAdmin = location.hash === "#/admin";
	}

	function resolveFromUrl(): ActiveVersion | null {
		const params = new URLSearchParams(location.search);
		const q = params.get("v");
		if (q === "v1" || q === "v2") return q;
		if (location.pathname.startsWith("/v1")) return "v1";
		if (location.pathname.startsWith("/v2")) return "v2";
		return null;
	}

	onMount(async () => {
		syncAdmin();
		window.addEventListener("hashchange", syncAdmin);
		const forced = resolveFromUrl();
		if (forced) {
			version = forced;
		} else {
			const res = await getActiveVersion();
			if (res.ok) version = res.data.version;
		}
		ready = true;
		return () => window.removeEventListener("hashchange", syncAdmin);
	});
</script>

{#if ready}
	{#if isAdmin || version === "v1"}
		<V1App />
	{:else}
		<V2App />
	{/if}
{/if}
