import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { guests, messages } from "../schema";
import { rateLimiter, readJsonBody } from "../middleware";
import {
	ADMIN_COOKIE,
	adminCookieOptions,
	isSecureRequest,
	requireAdmin,
	signAdminToken,
	timingSafePassword,
} from "../admin";
import {
	validateMessagePatch,
	validateRsvpPatch,
} from "../lib/validate";

export const adminRoutes = new Hono();

const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function parsePositiveInt(raw: string | undefined, fallback: number): number | null {
	if (raw === undefined) {
		return fallback;
	}
	const value = Number.parseInt(raw, 10);
	if (!Number.isInteger(value) || value < 1) {
		return null;
	}
	return value;
}

function hasListQuery(c: { req: { query: (...args: string[]) => unknown } }): boolean {
	return (
		c.req.query("q") !== undefined ||
		c.req.query("attendance") !== undefined ||
		c.req.query("page") !== undefined ||
		c.req.query("limit") !== undefined
	);
}

function toPage<T>(rows: T[], total: number, page: number, limit: number) {
	return { rows, total, page, limit };
}

adminRoutes.post("/login", rateLimiter(5, 15 * 60 * 1000), async (c) => {
	const body = await readJsonBody(c);
	if (body === null || typeof body !== "object" || !("password" in body)) {
		return c.json({ error: "invalid JSON" }, 400);
	}
	const candidate =
		typeof (body as { password: unknown }).password === "string"
			? (body as { password: string }).password
			: "";
	const secret = process.env.ADMIN_PASSWORD ?? "";
	const ok = await timingSafePassword(candidate, secret);
	if (!ok) {
		return c.json({ error: "Kata sandi salah" }, 401);
	}
	const { token, expires } = await signAdminToken();
	setCookie(c, ADMIN_COOKIE, token, {
		...adminCookieOptions(isSecureRequest(c)),
		expires: new Date(expires),
	});
	return c.json({ ok: true });
});

adminRoutes.post("/logout", requireAdmin(), (c) => {
	deleteCookie(c, ADMIN_COOKIE, { path: "/" });
	return c.json({ ok: true });
});

adminRoutes.get("/messages", requireAdmin(), async (c) => {
	const usePage = hasListQuery(c);
	const q = (c.req.query("q") ?? "").trim().toLowerCase();
	const page = parsePositiveInt(c.req.query("page"), DEFAULT_PAGE);
	const rawLimit = parsePositiveInt(c.req.query("limit"), DEFAULT_LIMIT);
	if (page === null || rawLimit === null) {
		return c.json({ error: "page dan limit harus bilangan bulat minimal 1" }, 400);
	}
	const limit = Math.min(rawLimit, MAX_LIMIT);
	const rows = await getDb()
		.select()
		.from(messages)
		.orderBy(desc(messages.createdAt))
		.limit(200);
	const mapped = rows.map((row) => ({ ...row, admin: false }));
	if (!usePage) {
		return c.json(mapped);
	}
	const filtered =
		q.length === 0
			? mapped
			: mapped.filter(
					(row) =>
						row.name.toLowerCase().includes(q) ||
						row.message.toLowerCase().includes(q),
				);
	const total = filtered.length;
	const start = (page - 1) * limit;
	return c.json(toPage(filtered.slice(start, start + limit), total, page, limit));
});

adminRoutes.get("/rsvp", requireAdmin(), async (c) => {
	const usePage = hasListQuery(c);
	const q = (c.req.query("q") ?? "").trim().toLowerCase();
	const attendance = c.req.query("attendance");
	if (
		attendance !== undefined &&
		attendance !== "yes" &&
		attendance !== "no" &&
		attendance !== "maybe"
	) {
		return c.json({ error: "attendance harus salah satu dari yes, no, maybe" }, 400);
	}
	const page = parsePositiveInt(c.req.query("page"), DEFAULT_PAGE);
	const rawLimit = parsePositiveInt(c.req.query("limit"), DEFAULT_LIMIT);
	if (page === null || rawLimit === null) {
		return c.json({ error: "page dan limit harus bilangan bulat minimal 1" }, 400);
	}
	const limit = Math.min(rawLimit, MAX_LIMIT);
	const rows = await getDb()
		.select()
		.from(guests)
		.orderBy(desc(guests.createdAt))
		.limit(500);
	const mapped = rows.map((row) => ({ ...row, admin: false }));
	if (!usePage) {
		return c.json(mapped);
	}
	const filtered = mapped.filter((row) => {
		if (attendance !== undefined && row.attendance !== attendance) {
			return false;
		}
		if (q.length === 0) {
			return true;
		}
		return (
			row.name.toLowerCase().includes(q) ||
			(row.phone ?? "").toLowerCase().includes(q)
		);
	});
	const total = filtered.length;
	const start = (page - 1) * limit;
	return c.json(toPage(filtered.slice(start, start + limit), total, page, limit));
});

adminRoutes.delete("/messages/:id", requireAdmin(), async (c) => {
	await getDb().delete(messages).where(eq(messages.id, c.req.param("id")));
	return c.json({ ok: true });
});

adminRoutes.delete("/rsvp/:id", requireAdmin(), async (c) => {
	await getDb().delete(guests).where(eq(guests.id, c.req.param("id")));
	return c.json({ ok: true });
});

adminRoutes.patch("/messages/:id", requireAdmin(), async (c) => {
	const body = await readJsonBody(c);
	if (body === null) {
		return c.json({ error: "invalid JSON" }, 400);
	}
	const result = validateMessagePatch(body);
	if (!result.ok) {
		return c.json({ error: "validation failed", errors: result.errors }, 400);
	}
	await getDb()
		.update(messages)
		.set(result.data)
		.where(eq(messages.id, c.req.param("id")));
	return c.json({ ok: true });
});

adminRoutes.patch("/rsvp/:id", requireAdmin(), async (c) => {
	const body = await readJsonBody(c);
	if (body === null) {
		return c.json({ error: "invalid JSON" }, 400);
	}
	const result = validateRsvpPatch(body);
	if (!result.ok) {
		return c.json({ error: "validation failed", errors: result.errors }, 400);
	}
	await getDb()
		.update(guests)
		.set(result.data)
		.where(eq(guests.id, c.req.param("id")));
	return c.json({ ok: true });
});