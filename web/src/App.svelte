<script lang="ts">
	import { onMount } from "svelte";
	import "@lottiefiles/dotlottie-wc";
	const ringsUrl = "/rings.lottie";
	const prefersReduced =
		typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	import "./lib/sprites.css";
	import { event } from "./lib/content";

	const inviteDates = "8 November 2026";
	const inviteHours = "09.00 - 13.00";
	import Admin from "./routes/admin.svelte";
	import SectionCouple from "./lib/SectionCouple.svelte";
	import SectionStory from "./lib/SectionStory.svelte";
	import SectionSchedule from "./lib/SectionSchedule.svelte";
	import SectionGallery from "./lib/SectionGallery.svelte";
	import SectionRsvp from "./lib/SectionRsvp.svelte";
	import SectionMessages from "./lib/SectionMessages.svelte";
	import SectionClosing from "./lib/SectionClosing.svelte";
	import CoupleFlip from "./lib/CoupleFlip.svelte";
	import MomentKita from "./lib/MomentKita.svelte";

	const target = new Date("2026-11-08T09:00:00+07:00").getTime();
	let opened = $state(false);
	let closing = $state(false);
	let phase = $state(prefersReduced ? "cover" : "intro");
	let now = $state(Date.now());
	let isAdmin = $state(false);

	$effect(() => {
		if (typeof document === "undefined") return;
		document.body.classList.toggle("is-locked", !opened);
		document.body.classList.toggle("is-bg", pageBgReady);
	});

	let introTimer: ReturnType<typeof setTimeout> | null = null;
	let bgReady = $state(false);
	let pageBgReady = $state(false);

	onMount(() => {
		if (phase !== "intro") return;
		introTimer = setTimeout(() => (phase = "cover"), 4200);
		return () => {
			if (introTimer) clearTimeout(introTimer);
		};
	});

	onMount(() => {
		const syncHash = () => (isAdmin = location.hash === "#/admin");
		syncHash();
		window.addEventListener("hashchange", syncHash);
		return () => window.removeEventListener("hashchange", syncHash);
	});

	onMount(() => {
		let scrollTimer: ReturnType<typeof setTimeout> | null = null;
		const onScroll = () => {
			document.body.classList.add("is-scrolling");
			if (scrollTimer) clearTimeout(scrollTimer);
			scrollTimer = setTimeout(() => {
				document.body.classList.remove("is-scrolling");
				scrollTimer = null;
			}, 150);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (scrollTimer) clearTimeout(scrollTimer);
		};
	});

	$effect(() => {
		const timer = setInterval(() => (now = Date.now()), 1000 - (Date.now() % 1000));
		return () => clearInterval(timer);
	});

	const remaining = $derived(Math.max(0, target - now));
	const days = $derived(Math.floor(remaining / 86_400_000));
	const hours = $derived(Math.floor((remaining % 86_400_000) / 3_600_000));
	const minutes = $derived(Math.floor((remaining % 3_600_000) / 60_000));
	const seconds = $derived(Math.floor((remaining % 60_000) / 1000));

	onMount(() => {
		const root = document.documentElement;
		const preload = new Image();
		preload.onload = () => {
			root.classList.add("bg-webp");
			bgReady = true;
		};
		preload.onerror = () => {
			const fallback = new Image();
			fallback.onload = () => {
				root.classList.add("bg-jpg");
				bgReady = true;
			};
			fallback.onerror = () => {
				root.classList.add("bg-jpg");
				bgReady = true;
			};
			fallback.src = "/bgcover.jpg";
		};
		preload.src = "/bgcover.webp";

		const preloadPage = new Image();
		preloadPage.onload = () => (pageBgReady = true);
		preloadPage.onerror = () => {
			const fallbackPage = new Image();
			fallbackPage.onload = () => (pageBgReady = true);
			fallbackPage.onerror = () => (pageBgReady = true);
			fallbackPage.src = "/bg01.jpg";
		};
		preloadPage.src = "/bg01.webp";

		const revealObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-inview");
						revealObserver.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.15 }
		);
		for (const el of document.querySelectorAll("[data-reveal]")) {
			revealObserver.observe(el);
		}

		ensureYtPlayer();
	});

	let sceneEl: HTMLElement | null = $state(null);
	let swapped = $state(false);
	let named = $state(false);
	const arabBadge = "ألسلام عليكم ورحمة الله وبركاته";
	let currentTitle = $state(arabBadge);
	const activeKey = $derived(currentTitle === arabBadge ? "__arab" : currentTitle);

	type NavIcon = { key: string; label: string; outline: string; solid: string };
	const navIcons: NavIcon[] = [
		{
			key: "__arab",
			label: "Awal",
			outline:
				'<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>',
			solid:
				'<path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"/><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"/>',
		},
		{
			key: "Momen Kita",
			label: "Momen Kita",
			outline:
				'<path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"/>',
			solid:
				'<path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z"/><path fill-rule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd"/>',
		},
		{
			key: "Sepasang Mempelai",
			label: "Sepasang Mempelai",
			outline:
				'<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/>',
			solid:
				'<path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"/>',
		},
		{
			key: "Perjalanan Kami",
			label: "Perjalanan Kami",
			outline:
				'<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>',
			solid:
				'<path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z"/>',
		},
		{
			key: "Rangkaian Acara",
			label: "Rangkaian Acara",
			outline:
				'<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"/>',
			solid:
				'<path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"/><path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clip-rule="evenodd"/>',
		},
		{
			key: "Momen Terindah",
			label: "Momen Terindah",
			outline:
				'<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>',
			solid:
				'<path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clip-rule="evenodd"/>',
		},
		{
			key: "Konfirmasi Kehadiran",
			label: "Konfirmasi Kehadiran",
			outline: '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>',
			solid:
				'<path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd"/>',
		},
		{
			key: "Tinggalkan Pesan",
			label: "Tinggalkan Pesan",
			outline:
				'<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/>',
			solid:
				'<path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.916.455-5.922.505a.39.39 0 0 0-.266.112L8.78 21.53A.75.75 0 0 1 7.5 21v-3.955a48.842 48.842 0 0 1-2.652-.316c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clip-rule="evenodd"/>',
		},
		{
			key: "Doa dan Restu",
			label: "Doa dan Restu",
			outline:
				'<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>',
			solid:
				'<path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clip-rule="evenodd"/>',
		},
	];

	function jumpTo(key: string) {
		if (typeof window === "undefined") return;
		const behavior = prefersReduced ? "auto" : "smooth";
		if (key === "__arab") {
			window.scrollTo({ top: 0, behavior });
			return;
		}
		document.querySelector(`[data-title="${key}"]`)?.scrollIntoView({ behavior, block: "start" });
	}

	onMount(() => {
		const spy = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const t = (entry.target as HTMLElement).dataset.title;
						currentTitle = !t || t === "__arab" ? arabBadge : t;
					}
				}
			},
			{ rootMargin: "-40% 0px -55% 0px", threshold: 0 }
		);
		for (const el of document.querySelectorAll("[data-title]")) {
			spy.observe(el);
		}
		return () => spy.disconnect();
	});

	onMount(() => {
		if (prefersReduced) return;
		let ticking = false;
		const update = () => {
			ticking = false;
			if (!sceneEl) return;
			const total = sceneEl.offsetHeight - window.innerHeight;
			const p = total > 0 ? Math.min(1, Math.max(0, -sceneEl.getBoundingClientRect().top / total)) : 0;
			swapped = p > 0.12;
			named = p > 0.55;
		};
		const onScroll = () => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	});

	function openInvite() {
		if (closing) return;
		if (prefersReduced) {
			opened = true;
		} else {
			closing = true;
			window.setTimeout(() => {
				opened = true;
			}, 750);
		}
		musicOn = true;
		applyMusic(true);
	}

	function pad(value: number): string {
		return String(value).padStart(2, "0");
	}

	function shareText(): string {
		const dates =
			event.dateStart === event.dateEnd ? event.dateStart : `${event.dateStart} sampai ${event.dateEnd}`;
		return `Undangan Ngunduh Mantu ${event.groom} & ${event.bride}, ${dates} di ${event.venue}.`;
	}

	let musicOn = $state(false);
	let ytPlayer: unknown = null;
	let ytReady = false;
	let ytStarted = $state(false);

	function applyMusic(restart = false) {
		const p = ytPlayer as any;
		if (!p || !ytReady) return;
		if (musicOn) {
			ytStarted = true;
			if (restart) p.seekTo(0, true);
			p.unMute();
			p.setVolume(100);
			p.playVideo();
		} else if (ytStarted) {
			p.pauseVideo();
		}
	}

	function buildYtPlayer() {
		const w = window as any;
		ytPlayer = new w.YT.Player("yt-player", {
			videoId: "-Y9VtoPvtuM",
			playerVars: {
				autoplay: 1,
				mute: 1,
				loop: 1,
				playlist: "-Y9VtoPvtuM",
				playsinline: 1,
				controls: 0,
				rel: 0,
			},
			events: {
				onReady: (e: any) => {
					ytReady = true;
					e.target.setVolume(100);
					applyMusic();
				},
				onStateChange: (e: any) => {
					if (e.data === w.YT.PlayerState.ENDED) musicOn = false;
				},
			},
		});
	}

	function ensureYtPlayer() {
		const w = window as any;
		if (w.YT && w.YT.Player) {
			buildYtPlayer();
			return;
		}
		w.onYouTubeIframeAPIReady = buildYtPlayer;
		if (!w.__wedduYtLoaded) {
			w.__wedduYtLoaded = true;
			const s = document.createElement("script");
			s.src = "https://www.youtube.com/iframe_api";
			s.async = true;
			document.head.appendChild(s);
		}
	}

	function toggleMusic() {
		musicOn = !musicOn;
		if (ytPlayer) applyMusic();
		else ensureYtPlayer();
	}
</script>

<div class="phone">
	{#if isAdmin}
		<Admin />
	{:else}
	<div class="invite">
	{#if !opened}
		<button
			class="cover"
			class:closing
			class:pre={phase === "intro"}
			class:bg-ready={bgReady}
			type="button"
			onclick={openInvite}
			aria-label="Buka undangan"
			inert={phase === "intro"}
		>
			{#key phase}
			<span class="cover-inner">
				<span class="monogram" aria-hidden="true"
					><span class="m-line">{event.groom}</span
					><span class="m-line">{event.bride}</span></span
				>
				<span class="tap-hint"
					><span class="h-word">Ketuk</span>
					<span class="h-word">untuk</span>
					<span class="h-word">membuka</span></span
				>
			</span>
			{/key}
		</button>
		{#if phase === "intro"}
			<div
				class="intro"
				class:bg-ready={bgReady}
				role="status"
				aria-label="Undangan Ngunduh Mantu"
			>
				<span class="rings rings--intro" aria-hidden="true">
					<dotlottie-wc src={ringsUrl} autoplay={!prefersReduced} loop></dotlottie-wc>
				</span>
			</div>
		{/if}
	{/if}

	<header class="hero" aria-label={event.title}>
	{#if prefersReduced}
		<div class="mono-stage">
			<span class="page-mono" aria-hidden="true">
				<span class="m-line">U</span>
				<span class="m-line">S</span>
			</span>
			<p class="page-names">{event.groom}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{event.bride}</p>
		</div>
		<CoupleFlip active />
	{:else}
		<section class="scene" bind:this={sceneEl} class:swapped class:named aria-label="Ubaid dan Sofia" data-title="__arab">
			<div class="pin">
				<div class="swap">
					<div class="mono-stage" aria-hidden={swapped}>
						<span class="page-mono" aria-hidden="true">
							<span class="m-line">U</span>
							<span class="m-line">S</span>
						</span>
						<p class="page-names">{event.groom}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{event.bride}</p>
					</div>
					<div class="flipwrap" aria-hidden={!swapped || named}>
						<CoupleFlip active={swapped && !named} />
					</div>
					<div class="nameswap" aria-hidden={!named}>
						<div class="n-line">
							<div class="ic-couple">
								<p class="ic-name">
									<span class="w" style="--wd: 0">Ubaid</span>
									<span class="w" style="--wd: 1">Khoiri</span>
								</p>
								<p class="ic-parents">
									<span class="ic-amp">
										<span class="w" style="--wd: 2">Putra</span>
										<span class="w" style="--wd: 3">dari</span>
									</span>
									<span class="folks"
										><span class="w" style="--wd: 4">Bapak</span>
										<strong><span class="w" style="--wd: 5">Amin</span></strong>
										<span class="w" style="--wd: 6">&amp;</span>
										<span class="w" style="--wd: 7">Ibu</span>
										<strong
											><span class="w" style="--wd: 8">Dwi</span>
											<span class="w" style="--wd: 9">Suprihatin</span>
											<span class="w" style="--wd: 10">R</span></strong
										></span
									>
								</p>
							</div>
						</div>
						<div class="n-line n-gap">
							<p class="ic-amp"><span class="w" style="--wd: 14">dengan</span></p>
						</div>
						<div class="n-line">
							<div class="ic-couple">
								<p class="ic-name">
									<span class="w" style="--wd: 17">Almar'atus</span>
									<span class="w" style="--wd: 18">Sofia</span>
									<span class="w" style="--wd: 19">T.</span>
								</p>
								<p class="ic-parents">
									<span class="ic-amp">
										<span class="w" style="--wd: 20">Putri</span>
										<span class="w" style="--wd: 21">dari</span>
									</span>
									<span class="folks"
										><span class="w" style="--wd: 22">Bapak</span>
										<strong
											><span class="w" style="--wd: 23">Agung</span>
											<span class="w" style="--wd: 24">Pitana</span></strong
										>
										<span class="w" style="--wd: 25">&amp;</span>
										<span class="w" style="--wd: 26">Ibu</span>
										<strong><span class="w" style="--wd: 27">Karmini</span></strong></span
									>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	{/if}

		<div class="invite-copy">
			<span class="ic-divider" aria-hidden="true"></span>

			<p class="ic-label">Resepsi Ngunduh Mantu</p>
			<p class="ic-dates">{inviteDates}</p>
			<p class="ic-time">{inviteHours}</p>

			<p class="ic-label">Lokasi</p>
			<p class="ic-dates">{event.venue}</p>
			<a class="ic-map" href={event.mapsUrl} target="_blank" rel="noreferrer">Buka di Google Maps</a>

			<p class="ic-prose">
				Ungkapan terima kasih yang tulus dari kami atas kehadiran serta doa restu
				Bapak/Ibu/Saudara/i sekalian. Wassalamu&rsquo;alaikum Warahmatullahi Wabarakatuh.
			</p>

			<p class="ic-signlabel">Kami yang berbahagia,</p>
			<p class="ic-signature">Keluarga Besar Amin</p>
		</div>

		<div data-reveal data-title="Momen Kita"><MomentKita /></div>

		<div class="card hero-title">
			<p class="eyebrow">Undangan Ngunduh Mantu</p>
			<h1>
				<span class="name">{event.groom}</span>
				<span class="amp">&amp;</span>
				<span class="name">{event.bride}</span>
			</h1>
			<p class="date-line">
				{event.dateStart === event.dateEnd
					? event.dateStart
					: `${event.dateStart} - ${event.dateEnd}`}
			</p>
			<p class="venue">{event.venue}</p>
		</div>

		<div class="row">
			<div class="card countdown" role="timer" aria-label="Hitung mundur menuju acara utama">
				{#each [
					{ label: "Hari", value: days },
					{ label: "Jam", value: hours },
					{ label: "Menit", value: minutes },
					{ label: "Detik", value: seconds },
				] as cell (cell.label)}
					<span class="cell">
						<strong>{pad(cell.value)}</strong>
						<small>{cell.label}</small>
					</span>
				{/each}
			</div>
			<div class="card hero-meta">
				<span class="crescent" aria-hidden="true">
					<svg
						viewBox="0 0 40 40"
						width="32"
						height="32"
						fill="none"
						stroke="var(--color-accent)"
						stroke-width="2"
						stroke-linecap="round"
					>
						<path d="M27 7a15 15 0 1 0 6 19 12.5 12.5 0 0 1-6-19Z" />
					</svg>
				</span>
				<p class="meta-label">Ngunduh Mantu</p>
				<p class="meta-value">{event.mainDay}</p>
				<p class="meta-sub">Pukul {event.mainTime} WIB</p>
			</div>
		</div>
	</header>

	<div data-reveal data-title="Sepasang Mempelai"><SectionCouple /></div>
	<div data-reveal data-title="Perjalanan Kami"><SectionStory /></div>
	<div data-reveal data-title="Rangkaian Acara"><SectionSchedule /></div>
	<div data-reveal data-title="Momen Terindah"><SectionGallery /></div>
	<div data-reveal data-title="Konfirmasi Kehadiran"><SectionRsvp /></div>
	<div data-reveal data-title="Tinggalkan Pesan"><SectionMessages /></div>
	<div data-reveal data-title="Doa dan Restu"><SectionClosing /></div>

	<div id="yt-player" class="player" aria-hidden="true" tabindex="-1"></div>

	{#if opened}
		<div class="fade-top" aria-hidden="true"></div>
		<div class="fade-bottom" aria-hidden="true"></div>
		<div class="topbar" role="status" aria-label={currentTitle}>
			{#key currentTitle}
				<p class="topbar-badge">{currentTitle}</p>
			{/key}
		</div>
	{/if}

	<div class="fab-layer">
		<nav class="bottombar" aria-label="Navigasi bagian">
			{#each navIcons as item (item.key)}
				<button
					type="button"
					class="bb-btn"
					class:is-active={activeKey === item.key}
					onclick={() => jumpTo(item.key)}
					aria-label={item.label}
					aria-current={activeKey === item.key ? "true" : undefined}
					title={item.label}
				>
					{#if activeKey === item.key}
						<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"
							>{@html item.solid}</svg
						>
					{:else}
						<svg
							viewBox="0 0 24 24"
							width="15"
							height="15"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true">{@html item.outline}</svg
						>
					{/if}
				</button>
			{/each}
			<span class="bb-sep" aria-hidden="true"></span>
			<button
				type="button"
				class="bb-btn"
				class:is-active={musicOn}
				onclick={toggleMusic}
				aria-pressed={musicOn}
				aria-label={musicOn ? "Jeda musik" : "Putar musik"}
				title={musicOn ? "Jeda musik" : "Putar musik"}
			>
				{#if musicOn}
					<svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor" aria-hidden="true">
						<rect x="4" y="4" width="4" height="12" rx="1" />
						<rect x="12" y="4" width="4" height="12" rx="1" />
					</svg>
				{:else}
					<svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor" aria-hidden="true">
						<path d="M6 4.5v11l9-5.5z" />
					</svg>
				{/if}
			</button>
			<a
				class="bb-btn"
				href="https://wa.me/?text={encodeURIComponent(shareText())}"
				target="_blank"
				rel="noreferrer"
				aria-label="Bagikan undangan lewat WhatsApp"
				title="Bagikan lewat WhatsApp"
			>
				<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
					<path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.94L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.09.89.9-3-.2-.31a8.2 8.2 0 1 1 6.88 3.75Zm4.53-6.14c-.25-.12-1.46-.72-1.68-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.39-1.99-1.23-.73-.66-1.23-1.46-1.38-1.71-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
				</svg>
			</a>
		</nav>
	</div>

	<footer class="admin-link">
		<a href="#/admin">Admin</a>
	</footer>
	</div>
	{/if}
</div>

<style>
	.phone {
		display: flex;
		flex-direction: column;
	}

	.invite {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
		padding: 0 var(--spacing-page-inset) 140px;
		min-height: 100svh;
	}

	.card {
		background: var(--color-bg-glass);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-surface);
		padding: var(--spacing-m);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.cover {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100vh;
		height: 100lvh;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-l);
		background-color: var(--color-bg-base);
		border: 0;
		cursor: pointer;
	}

	.cover.pre {
		opacity: 0;
		pointer-events: none;
	}

	.cover::after,
	.intro::after {
		content: "";
		position: absolute;
		inset: 0;
		background-image: linear-gradient(var(--color-photo-tint), var(--color-photo-tint));
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		opacity: 0;
		transition: opacity var(--duration-slow) var(--ease-out);
		pointer-events: none;
	}

	:global(html.bg-jpg) .cover::after,
	:global(html.bg-jpg) .intro::after {
		background-image:
			linear-gradient(var(--color-photo-tint), var(--color-photo-tint)),
			url("/bgcover.jpg");
	}

	:global(html.bg-webp) .cover::after,
	:global(html.bg-webp) .intro::after {
		background-image:
			linear-gradient(var(--color-photo-tint), var(--color-photo-tint)),
			url("/bgcover.webp");
	}

	.cover.bg-ready::after,
	.intro.bg-ready::after {
		opacity: 1;
	}

	.intro {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100vh;
		height: 100lvh;
		z-index: 21;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-m);
		padding: var(--spacing-l);
		background-color: var(--color-bg-base);
	}

	.intro::before,
	.cover::before {
		content: "";
		position: absolute;
		inset: 0;
		margin: 0 auto;
		width: 100%;
		max-width: 393px;
		border-inline: var(--border-width-hairline) solid var(--color-stroke-weak);
		pointer-events: none;
	}

	.rings--intro {
		position: relative;
		z-index: 1;
		width: 208px;
		height: 208px;
		color: var(--color-text-strong);
	}

	.rings--intro dotlottie-wc {
		width: 100%;
		height: 100%;
		overflow: hidden;
		filter: invert(1);
		opacity: 0.2;
	}

	@media (prefers-reduced-motion: no-preference) {
		.rings--intro {
			animation:
				intro-ring-in var(--duration-slow) var(--ease-out) both,
				intro-lottie-out 600ms var(--ease-out) 3.4s both;
		}

		@keyframes intro-ring-in {
			from {
				opacity: 0;
				transform: scale(0.9);
			}
			to {
				opacity: 1;
				transform: none;
			}
		}

		@keyframes intro-lottie-out {
			to {
				opacity: 0;
			}
		}
	}

	.cover-inner {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 340px;
		width: 100%;
		min-height: 100svh;
		padding: var(--spacing-xl) var(--spacing-m);
	}

.cover-inner .m-line + .m-line {
		margin-top: calc(-1 * var(--spacing-s));
	}

	.cover-inner .monogram {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: var(--text-monogram);
		line-height: 0.87;
		letter-spacing: 0;
		text-align: center;
		color: var(--color-cover-sign);
		text-shadow:
			0 1px 1px var(--color-cover-shadow),
			1px 2px 2px var(--color-cover-shadow);
	}

	@media (prefers-reduced-motion: no-preference) {
		.cover:not(.pre) .cover-inner .monogram {
			animation: mono-float var(--duration-ambient-slow) var(--ease-in-out) infinite;
		}

		@keyframes mono-float {
			0%,
			100% {
				transform: translateY(0);
			}
			50% {
				transform: translateY(calc(-1 * (var(--spacing-2xs) + var(--spacing-2xs) / 2)));
			}
		}

		.cover:not(.pre) .cover-inner .m-line,
		.cover:not(.pre) .tap-hint .h-word {
			animation: mono-word-in 800ms var(--ease-out) both;
		}

		.cover:not(.pre) .cover-inner .m-line:nth-child(1) {
			animation-delay: 200ms;
		}

		.cover:not(.pre) .cover-inner .m-line:nth-child(2) {
			animation-delay: 450ms;
		}

		.cover:not(.pre) .tap-hint .h-word:nth-child(1) {
			animation-delay: 1600ms;
		}

		.cover:not(.pre) .tap-hint .h-word:nth-child(2) {
			animation-delay: 1850ms;
		}

		.cover:not(.pre) .tap-hint .h-word:nth-child(3) {
			animation-delay: 2100ms;
		}

		@keyframes mono-word-in {
			from {
				opacity: 0;
				transform: translateY(var(--spacing-s));
			}
			to {
				opacity: 1;
				transform: none;
			}
		}
	}

	.eyebrow {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-brand);
		margin: 0;
	}

	.rings {
		width: 200px;
		height: 200px;
		color: var(--color-text-strong);
	}

	.rings dotlottie-wc {
		width: 100%;
		height: 100%;
		overflow: hidden;
		filter: invert(1);
	}

	.cover:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: -4px;
	}

	.cover.closing {
		pointer-events: none;
		animation: cover-out 700ms var(--ease-out) forwards;
	}

	@media (prefers-reduced-motion: no-preference) {
		@keyframes cover-out {
			to {
				opacity: 0;
				visibility: hidden;
			}
		}
	}

	.tap-hint {
		position: absolute;
		inset-inline: 0;
		bottom: 31.25%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2xs);
		min-height: var(--size-touch-target);
		padding: var(--spacing-2xs) var(--spacing-s);
		font-family: var(--font-text);
		font-size: calc(var(--text-caption) - var(--spacing-2xs));
		font-weight: var(--font-weight-regular);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-weak);
	}

	@media (prefers-reduced-motion: no-preference) {
		.tap-hint {
			animation: hint-blink 3.2s var(--ease-in-out) infinite;
		}

		@keyframes hint-blink {
			0%,
			100% {
				opacity: 0.25;
			}
			50% {
				opacity: 0.6;
			}
		}
	}

	.hero {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.mono-stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 150px 0 var(--spacing-page-bottom);
	}

	.page-mono {
		position: relative;
		z-index: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: calc(var(--text-monogram) * 1.3);
		line-height: calc(var(--spacing-page-mono-line) * 1.3);
		color: var(--color-cover-sign);
		margin: 0;
		padding-inline: var(--spacing-page-mono-edges);
		contain: layout style;
	}

	.page-names {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		padding-inline: var(--spacing-m);
		text-align: center;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: calc(var(--text-body) * 1.25);
		line-height: var(--leading-body);
		color: var(--color-text-strong);
		white-space: nowrap;
	}

	.page-mono .m-line {
		display: block;
	}

	.scene {
		height: 220vh;
		height: 220svh;
		/* Lepas dari pagar 60% global. Section ini full lebar phone. */
		margin-inline: calc(var(--spacing-page-inset) * -1);
	}

	.pin {
		position: -webkit-sticky;
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100svh;
		overflow: hidden;
	}

	.swap {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.scene .mono-stage {
		margin: 0;
		will-change: transform, opacity;
		transition:
			opacity 1s ease,
			transform 2s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.scene.swapped .mono-stage {
		opacity: 0;
		transform: translateY(-60px) scale(0.6);
		visibility: hidden;
		pointer-events: none;
	}

	.flipwrap {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		will-change: transform, opacity;
		opacity: 0;
		transform: scale(0.8);
		visibility: hidden;
		pointer-events: none;
		transition:
			opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
			visibility 0s 0.6s;
	}

	.scene.swapped .flipwrap {
		opacity: 1;
		transform: scale(1);
		visibility: visible;
		pointer-events: auto;
		transition:
			opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
			visibility 0s 0s;
	}

	.flipwrap > :global(.jewel) {
		width: 100%;
		flex-shrink: 0;
		margin-top: 0;
	}

	.nameswap {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2xs);
		padding-inline: var(--spacing-s);
		text-align: center;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}

	.nameswap .n-line {
		opacity: 1;
	}

	.nameswap .n-gap {
		margin-block: 50px;
	}

	.nameswap .w {
		display: inline-block;
		opacity: 0;
		transform: translateY(10px);
		transition:
			opacity 0.45s ease,
			transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
		/* Keluar cascade balik. */
		transition-delay: calc((27 - var(--wd)) * 50ms);
	}

	.scene.named .nameswap .w {
		opacity: 1;
		transform: none;
		/* Masuk per kata 90ms. Nomor lompat di dengan = jeda napas. */
		transition-delay: calc(0.15s + var(--wd) * 90ms);
	}

	.scene.named .flipwrap {
		opacity: 0;
		transform: scale(0.9);
		visibility: hidden;
		pointer-events: none;
		transition:
			opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
			visibility 0s 0.5s;
	}

	.scene.named .nameswap {
		opacity: 1;
		visibility: visible;
	}

	@media (prefers-reduced-motion: no-preference) {
		.page-mono .m-line:first-child {
			animation: mono-drift 4.7s var(--ease-in-out) infinite;
			will-change: translate;
		}

		.page-mono .m-line:last-child {
			animation: mono-drift 6.3s var(--ease-in-out) -3.1s infinite;
			will-change: translate;
		}

		@keyframes mono-drift {
			0%,
			100% {
				translate: 0 0;
			}
			50% {
				translate: 0 -3px;
			}
		}

		body.is-scrolling .page-mono .m-line {
			animation-play-state: paused;
		}
	}

	.invite-copy {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--spacing-s);
		padding-block: var(--spacing-s);
		color: var(--color-text-strong);
	}

	.ic-couple {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-2xs);
		padding: 0;
		background: transparent;
		border: 0;
	}

	.ic-name {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--font-weight-regular);
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
	}

	.ic-parents {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-invite-parents);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
	}

	.ic-parents strong {
		font-weight: var(--font-weight-bold);
		color: var(--color-text-weak);
	}

	.ic-amp {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-size: var(--text-invite-prose);
		color: var(--color-text-brand);
	}

	.ic-divider {
		display: block;
		width: 100%;
		height: var(--border-width-hairline);
		background: var(--color-stroke-weak);
		margin-block: var(--spacing-xs);
	}

	.ic-label {
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.ic-dates {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
	}

	.ic-time {
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-caption);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
	}

	.ic-map {
		font-family: var(--font-text);
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-brand);
		text-decoration: underline;
		text-underline-offset: var(--spacing-2xs);
	}

	.ic-map:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: var(--spacing-2xs);
	}

	.ic-prose {
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-invite-prose);
		line-height: var(--leading-body);
		color: var(--color-text-weak);
	}

	.ic-signlabel {
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--text-invite-prose);
		color: var(--color-text-weak);
	}

	.ic-signature {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		color: var(--color-text-strong);
	}

	.page-mono .m-line:first-child {
		transform: translateX(calc(-1 * var(--spacing-page-mono-edges)));
	}

	.page-mono .m-line:last-child {
		transform: translateX(var(--spacing-page-mono-edges));
	}

	.hero-title {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-s);
		text-align: center;
	}

	.hero-title h1 {
		display: flex;
		align-items: baseline;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--spacing-s);
		font-size: var(--text-h1);
		line-height: var(--leading-h1);
		font-weight: var(--font-weight-regular);
		letter-spacing: var(--tracking-h1);
		color: var(--color-text-strong);
		margin: 0;
	}

	.name {
		font-family: var(--font-display);
		font-size: var(--text-h1);
		line-height: 1.15;
	}

	.amp {
		color: var(--color-accent);
		font-family: var(--font-display);
		font-size: var(--text-h2);
		line-height: 1;
	}

	.date-line {
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-brand);
		margin: 0;
	}

	.venue {
		font-size: var(--text-body);
		color: var(--color-text-weak);
		margin: 0;
	}

	.row {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	.row .card {
		flex: 1;
		min-width: 0;
	}

	.countdown {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-2xs);
	}

	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2xs);
		padding: var(--spacing-s);
		border-radius: var(--radius-control);
		background: var(--color-bg-glass);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.cell strong {
		font-size: var(--text-h3);
		line-height: var(--leading-h3);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-strong);
		font-variant-numeric: tabular-nums;
	}

	.cell small {
		font-size: var(--text-caption);
		color: var(--color-text-weak);
		text-transform: uppercase;
		letter-spacing: var(--tracking-caps);
	}

	.hero-meta {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2xs);
		text-align: center;
	}

	.crescent {
		color: var(--color-accent);
		margin-bottom: var(--spacing-2xs);
	}

	.meta-label {
		font-size: var(--text-caption);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-caps);
		color: var(--color-text-weak);
		margin: 0;
	}

	.meta-value {
		font-size: var(--text-body);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-strong);
		margin: 0;
	}

	.meta-sub {
		font-size: var(--text-caption);
		color: var(--color-text-weak);
		margin: 0;
	}

	.player {
		position: fixed;
		inset: auto 50% -9999px auto;
		width: 1px;
		height: 1px;
		border: 0;
	}

	.topbar {
		position: fixed;
		inset: 0 0 auto 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 393px;
		z-index: 30;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: var(--spacing-s) var(--spacing-s) var(--spacing-xs);
		pointer-events: none;
		text-align: center;
	}

	.topbar-badge {
		margin: 0;
		padding: var(--spacing-2xs) var(--spacing-s);
		font-family: var(--font-text);
		font-size: var(--text-invite-arab);
		line-height: var(--leading-body);
		color: var(--color-text-strong);
		background: var(--color-bg-glass);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		border-radius: var(--radius-full);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		animation: topbar-in 0.3s var(--ease-out);
	}

	@keyframes topbar-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.topbar-badge {
			animation: none;
		}
	}

	.fade-top,
	.fade-bottom {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 393px;
		z-index: 4;
		pointer-events: none;
		/* Pre-mixed rgba biar jalan iOS 16.1. Langsung luruh 20% ke 0, no solid. */
	}

	.fade-top {
		top: 0;
		height: 96px;
		background: linear-gradient(to bottom, rgba(249, 247, 244, 0.2), rgba(249, 247, 244, 0));
		-webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
		mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
	}

	.fade-bottom {
		bottom: 0;
		height: 80px;
		background: linear-gradient(to top, rgba(249, 247, 244, 0.2), rgba(249, 247, 244, 0));
		-webkit-mask-image: linear-gradient(to top, black 60%, transparent 100%);
		mask-image: linear-gradient(to top, black 60%, transparent 100%);
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
	}

	.fab-layer {
		position: fixed;
		inset: auto 0 0 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 393px;
		z-index: 10;
		padding: 0 var(--spacing-s) var(--spacing-s);
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.bottombar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		width: auto;
		max-width: 90%;
		margin: 0;
		padding: 4px 10px;
		border-radius: var(--radius-full);
		background: var(--color-bg-glass);
		border: var(--border-width-hairline) solid var(--color-stroke-weak);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		pointer-events: auto;
	}

	.bb-btn {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		padding: 0;
		border: 0;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--color-text-muted);
		opacity: 0.55;
		cursor: pointer;
		text-decoration: none;
		transition:
			color 0.2s ease,
			opacity 0.2s ease;
		flex-shrink: 0;
	}

	.bb-btn svg {
		display: block;
	}

	.bb-btn:hover {
		color: var(--color-text-strong);
		opacity: 1;
	}

	.bb-btn:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.bb-btn.is-active {
		color: var(--color-text-strong);
	}

	.bb-sep {
		width: var(--border-width-hairline);
		height: 18px;
		background: var(--color-stroke-weak);
		margin-inline: 4px;
		flex-shrink: 0;
	}

	[data-title] {
		scroll-margin-top: 76px;
	}

	.admin-link {
		padding: var(--spacing-s) 0 0;
		text-align: center;
		font-size: var(--text-caption);
	}

	.admin-link a {
		color: var(--color-text-weak);
		text-decoration: none;
	}

	.admin-link a:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}
</style>