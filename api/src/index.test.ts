import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { rateLimiter } from "./middleware";
import {
	validateMessage,
	validateMessagePatch,
	validateRsvp,
	validateRsvpPatch,
} from "./lib/validate";
import app from "./index";

vi.mock("./db", () => {
	const messageRows = [
		{
			id: "m1",
			name: "Budi",
			message: "Selamat menempuh hidup baru",
			hearts: 0,
			createdAt: "2026-01-01",
		},
		{
			id: "m2",
			name: "Sari",
			message: "Barakallah lakauma",
			hearts: 1,
			createdAt: "2026-01-02",
		},
		{
			id: "m3",
			name: "Andi",
			message: "Sampai jumpa di acara",
			hearts: 0,
			createdAt: "2026-01-03",
		},
	];
	const guestRows = [
		{
			id: "g1",
			name: "Budi",
			attendance: "yes",
			guests: 2,
			phone: "0811",
			createdAt: "2026-01-01",
		},
		{
			id: "g2",
			name: "Sari",
			attendance: "no",
			guests: 1,
			phone: null,
			createdAt: "2026-01-02",
		},
		{
			id: "g3",
			name: "Andi",
			attendance: "maybe",
			guests: 3,
			phone: "0812",
			createdAt: "2026-01-03",
		},
	];
	return {
		getDb: () => ({
			select: () => ({
				from: (table: unknown) => {
					const rows =
						typeof table === "object" &&
						table !== null &&
						"attendance" in (table as Record<string, unknown>)
							? guestRows
							: messageRows;
					const result = () => Promise.resolve(rows.map((row) => ({ ...row })));
					return {
						orderBy: () => ({
							limit: result,
						}),
						where: () => ({
							limit: () => Promise.resolve([]),
						}),
					};
				},
			}),
			insert: () => ({
				values: () => Promise.resolve(),
			}),
			delete: () => ({
				where: () => Promise.resolve(),
			}),
			update: () => ({
				set: () => ({
					where: () => Promise.resolve(),
				}),
			}),
		}),
	};
});

describe("validation", () => {
	it("accepts a valid rsvp", () => {
		const result = validateRsvp({
			name: "Budi",
			attendance: "yes",
			guests: 2,
			phone: "081234567890",
		});
		expect(result.ok).toBe(true);
	});

	it("rejects an unknown attendance value", () => {
		const result = validateRsvp({ name: "Budi", attendance: "maybe?!", guests: 1 });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain("attendance must be one of yes, no, maybe");
		}
	});

	it("rejects a guest count out of range", () => {
		const result = validateRsvp({ name: "Budi", attendance: "yes", guests: 9 });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("guests must be an integer between 1 and 5");
		}
	});

	it("accepts a valid message", () => {
		const result = validateMessage({ name: "Sari", message: "Selamat menempuh hidup baru" });
		expect(result.ok).toBe(true);
	});

	it("rejects a message longer than 500 characters", () => {
		const result = validateMessage({ name: "Sari", message: "x".repeat(501) });
		expect(result.ok).toBe(false);
	});

	it("rejects a blank message name is not allowed", () => {
		const result = validateMessage({ name: "", message: "selamat" });
		expect(result.ok).toBe(false);
	});
});

describe("rate limiter", () => {
	it("blocks the 31st request within a minute for one ip", async () => {
		const probe = new Hono();
		probe.use("/p", rateLimiter(30, 60_000));
		probe.get("/p", (c) => c.text("ok"));
		let last = 0;
		for (let i = 0; i < 31; i++) {
			const res = await probe.request("/p", {
				headers: { "cf-connecting-ip": "1.2.3.4" },
			});
			last = res.status;
		}
		expect(last).toBe(429);
	});
});

describe("admin login", () => {
	const original = process.env.ADMIN_PASSWORD;
	beforeEach(() => {
		process.env.ADMIN_PASSWORD = "test-secret";
	});
	afterAll(() => {
		process.env.ADMIN_PASSWORD = original;
	});

	it("returns 401 for the wrong password", async () => {
		const res = await app.request("/api/admin/login", {
			method: "POST",
			headers: { "content-type": "application/json", "cf-connecting-ip": "10.0.0.1" },
			body: JSON.stringify({ password: "wrong" }),
		});
		expect(res.status).toBe(401);
	});

	it("returns 200, sets a cookie, and 401 without it for the right password", async () => {
		const res = await app.request("/api/admin/login", {
			method: "POST",
			headers: { "content-type": "application/json", "cf-connecting-ip": "10.0.0.2" },
			body: JSON.stringify({ password: "test-secret" }),
		});
		expect(res.status).toBe(200);
		const setCookieHeader = res.headers.get("set-cookie") ?? "";
		expect(setCookieHeader).toContain("weddu_admin=");
		const cookieMatch = setCookieHeader.match(/weddu_admin=([^;]+)/);
		expect(cookieMatch).not.toBeNull();
		const cookie = cookieMatch?.[1] ?? "";

		const denied = await app.request("/api/admin/messages", {
			headers: { "cf-connecting-ip": "10.0.0.2" },
		});
		expect(denied.status).toBe(401);

		const allowed = await app.request("/api/admin/logout", {
			method: "POST",
			headers: { "cf-connecting-ip": "10.0.0.2", cookie: `weddu_admin=${cookie}` },
		});
		expect(allowed.status).toBe(200);
	});

	it("blocks the 6th failed login attempt within 15 minutes with 429", async () => {
		let last = 0;
		for (let i = 0; i < 6; i++) {
			const res = await app.request("/api/admin/login", {
				method: "POST",
				headers: { "content-type": "application/json", "cf-connecting-ip": "10.0.0.3" },
				body: JSON.stringify({ password: "nope" }),
			});
			last = res.status;
		}
		expect(last).toBe(429);
	});
});

describe("api app", () => {
	it("answers /api/health with 200", async () => {
		const res = await app.request("/api/health");
		expect(res.status).toBe(200);
	});

	it("returns 400 for malformed json on /api/rsvp", async () => {
		const res = await app.request("/api/rsvp", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "9.9.9.9",
			},
			body: "{",
		});
		expect(res.status).toBe(400);
	});

	it("returns 400 for an invalid rsvp body", async () => {
		const res = await app.request("/api/rsvp", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "9.9.9.8",
			},
			body: JSON.stringify({ name: "", attendance: "yes", guests: 99 }),
		});
		expect(res.status).toBe(400);
	});
});

describe("admin sheets task 3", () => {
	const original = process.env.ADMIN_PASSWORD;
	beforeEach(() => {
		process.env.ADMIN_PASSWORD = "test-secret";
	});
	afterAll(() => {
		process.env.ADMIN_PASSWORD = original;
	});

	async function loginCookie(ip: string): Promise<string> {
		const res = await app.request("/api/admin/login", {
			method: "POST",
			headers: { "content-type": "application/json", "cf-connecting-ip": ip },
			body: JSON.stringify({ password: "test-secret" }),
		});
		expect(res.status).toBe(200);
		const header = res.headers.get("set-cookie") ?? "";
		const match = header.match(/weddu_admin=([^;]+)/);
		expect(match).not.toBeNull();
		return match?.[1] ?? "";
	}

	it("menolak tanpa cookie dengan 401", async () => {
		for (const target of [
			"/api/admin/messages",
			"/api/admin/rsvp",
			"/api/admin/messages/m1",
			"/api/admin/rsvp/g1",
		]) {
			const method = target.includes("/m1") || target.includes("/g1") ? "DELETE" : "GET";
			const res = await app.request(target, {
				method,
				headers: { "cf-connecting-ip": "10.0.1.1" },
			});
			expect(res.status).toBe(401);
		}
		const patchMessages = await app.request("/api/admin/messages/m1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "10.0.1.1",
			},
			body: JSON.stringify({ message: "halo" }),
		});
		expect(patchMessages.status).toBe(401);
		const patchRsvp = await app.request("/api/admin/rsvp/g1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "10.0.1.1",
			},
			body: JSON.stringify({ guests: 2 }),
		});
		expect(patchRsvp.status).toBe(401);
	});

	it("menolak kata sandi salah dengan 401", async () => {
		const res = await app.request("/api/admin/login", {
			method: "POST",
			headers: { "content-type": "application/json", "cf-connecting-ip": "10.0.1.2" },
			body: JSON.stringify({ password: "salah" }),
		});
		expect(res.status).toBe(401);
	});

	it("lolos tambah pesan dengan 201", async () => {
		const res = await app.request("/api/messages", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "9.9.9.10",
			},
			body: JSON.stringify({ name: "Sari", message: "Selamat menempuh hidup baru" }),
		});
		expect(res.status).toBe(201);
	});

	it("lolos hapus pesan dan rsvp dengan 200", async () => {
		const cookie = await loginCookie("10.0.1.3");
		const delMessage = await app.request("/api/admin/messages/m1", {
			method: "DELETE",
			headers: { "cf-connecting-ip": "10.0.1.3", cookie: `weddu_admin=${cookie}` },
		});
		expect(delMessage.status).toBe(200);
		const delRsvp = await app.request("/api/admin/rsvp/g1", {
			method: "DELETE",
			headers: { "cf-connecting-ip": "10.0.1.3", cookie: `weddu_admin=${cookie}` },
		});
		expect(delRsvp.status).toBe(200);
	});

	it("daftar polos tetap array bila tanpa query baru", async () => {
		const cookie = await loginCookie("10.0.1.4");
		const messages = await app.request("/api/admin/messages", {
			headers: { "cf-connecting-ip": "10.0.1.4", cookie: `weddu_admin=${cookie}` },
		});
		expect(messages.status).toBe(200);
		expect(Array.isArray(await messages.json())).toBe(true);
		const rsvp = await app.request("/api/admin/rsvp", {
			headers: { "cf-connecting-ip": "10.0.1.4", cookie: `weddu_admin=${cookie}` },
		});
		expect(rsvp.status).toBe(200);
		expect(Array.isArray(await rsvp.json())).toBe(true);
	});

	it("mendukung cari dan paginasi dengan total dan halaman", async () => {
		const cookie = await loginCookie("10.0.1.5");
		const res = await app.request("/api/admin/messages?q=sari&page=1&limit=2", {
			headers: { "cf-connecting-ip": "10.0.1.5", cookie: `weddu_admin=${cookie}` },
		});
		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			rows: unknown[];
			total: number;
			page: number;
			limit: number;
		};
		expect(body.total).toBe(1);
		expect(body.page).toBe(1);
		expect(body.rows.length).toBe(1);
		const capped = await app.request("/api/admin/messages?page=1&limit=500", {
			headers: { "cf-connecting-ip": "10.0.1.5", cookie: `weddu_admin=${cookie}` },
		});
		expect(capped.status).toBe(200);
		expect(((await capped.json()) as { limit: number }).limit).toBe(100);
	});

	it("mendukung saring attendance dan menolak nilai tidak valid", async () => {
		const cookie = await loginCookie("10.0.1.6");
		const ok = await app.request("/api/admin/rsvp?attendance=yes", {
			headers: { "cf-connecting-ip": "10.0.1.6", cookie: `weddu_admin=${cookie}` },
		});
		expect(ok.status).toBe(200);
		const body = (await ok.json()) as { rows: unknown[]; total: number };
		expect(body.total).toBe(1);
		const bad = await app.request("/api/admin/rsvp?attendance=salah", {
			headers: { "cf-connecting-ip": "10.0.1.6", cookie: `weddu_admin=${cookie}` },
		});
		expect(bad.status).toBe(400);
		const badPage = await app.request("/api/admin/messages?page=0", {
			headers: { "cf-connecting-ip": "10.0.1.6", cookie: `weddu_admin=${cookie}` },
		});
		expect(badPage.status).toBe(400);
	});

	it("lolos ubah terbatas dengan validasi yang sama seperti buat", async () => {		expect(validateMessagePatch({ message: "Selamat" }).ok).toBe(true);
		expect(validateMessagePatch({}).ok).toBe(false);
		expect(validateRsvpPatch({ guests: 3 }).ok).toBe(true);
		expect(validateRsvpPatch({ guests: 99 }).ok).toBe(false);
		const cookie = await loginCookie("10.0.1.7");
		const patchOk = await app.request("/api/admin/messages/m1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "10.0.1.7",
				cookie: `weddu_admin=${cookie}`,
			},
			body: JSON.stringify({ message: "Selamat menempuh hidup baru" }),
		});
		expect(patchOk.status).toBe(200);
		const patchBad = await app.request("/api/admin/messages/m1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "10.0.1.7",
				cookie: `weddu_admin=${cookie}`,
			},
			body: JSON.stringify({}),
		});
		expect(patchBad.status).toBe(400);
		const patchRsvpOk = await app.request("/api/admin/rsvp/g1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "10.0.1.7",
				cookie: `weddu_admin=${cookie}`,
			},
			body: JSON.stringify({ guests: 3 }),
		});
		expect(patchRsvpOk.status).toBe(200);
		const patchRsvpBad = await app.request("/api/admin/rsvp/g1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "10.0.1.7",
				cookie: `weddu_admin=${cookie}`,
			},
			body: JSON.stringify({ guests: 99 }),
		});
		expect(patchRsvpBad.status).toBe(400);
	});
});

describe("version switch", () => {
	const original = process.env.ADMIN_PASSWORD;
	beforeEach(() => {
		process.env.ADMIN_PASSWORD = "test-secret";
	});
	afterAll(() => {
		process.env.ADMIN_PASSWORD = original;
	});

	async function loginCookie(ip: string): Promise<string> {
		const res = await app.request("/api/admin/login", {
			method: "POST",
			headers: { "content-type": "application/json", "cf-connecting-ip": ip },
			body: JSON.stringify({ password: "test-secret" }),
		});
		expect(res.status).toBe(200);
		const match = (res.headers.get("set-cookie") ?? "").match(/weddu_admin=([^;]+)/);
		expect(match).not.toBeNull();
		return match?.[1] ?? "";
	}

	it("publik baca versi default v2", async () => {
		const res = await app.request("/api/version");
		expect(res.status).toBe(200);
		expect(((await res.json()) as { version: string }).version).toBe("v2");
	});

	it("admin baca versi menolak tanpa cookie", async () => {
		const res = await app.request("/api/admin/version", {
			headers: { "cf-connecting-ip": "10.0.2.1" },
		});
		expect(res.status).toBe(401);
	});

	it("admin tulis versi lolos nilai valid dan tolak nilai salah", async () => {
		const cookie = await loginCookie("10.0.2.2");
		const ok = await app.request("/api/admin/version", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "10.0.2.2",
				cookie: `weddu_admin=${cookie}`,
			},
			body: JSON.stringify({ version: "v1" }),
		});
		expect(ok.status).toBe(200);
		const bad = await app.request("/api/admin/version", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"cf-connecting-ip": "10.0.2.2",
				cookie: `weddu_admin=${cookie}`,
			},
			body: JSON.stringify({ version: "v3" }),
		});
		expect(bad.status).toBe(400);
	});
});