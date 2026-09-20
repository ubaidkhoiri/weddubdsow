import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Hono } from "hono";
import { rateLimiter } from "./middleware";
import { validateMessage, validateRsvp } from "./lib/validate";
import app from "./index";

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