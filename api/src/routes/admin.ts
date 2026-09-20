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

export const adminRoutes = new Hono();

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
	const rows = await getDb()
		.select()
		.from(messages)
		.orderBy(desc(messages.createdAt))
		.limit(200);
	return c.json(rows.map((row) => ({ ...row, admin: false })));
});

adminRoutes.get("/rsvp", requireAdmin(), async (c) => {
	const rows = await getDb()
		.select()
		.from(guests)
		.orderBy(desc(guests.createdAt))
		.limit(500);
	return c.json(rows.map((row) => ({ ...row, admin: false })));
});

adminRoutes.delete("/messages/:id", requireAdmin(), async (c) => {
	await getDb().delete(messages).where(eq(messages.id, c.req.param("id")));
	return c.json({ ok: true });
});