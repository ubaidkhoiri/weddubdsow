import { Hono } from "hono";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { messages } from "../schema";
import { rateLimiter, readJsonBody } from "../middleware";
import { validateMessage } from "../lib/validate";

export const messageRoutes = new Hono();

messageRoutes.use("/messages", rateLimiter(30, 60_000));
messageRoutes.use("/messages/:id/heart", rateLimiter(30, 60_000));

function isValidMessageId(id: string): boolean {
	return id.length >= 1 && id.length <= 64 && /^[A-Za-z0-9_-]+$/.test(id);
}

messageRoutes.get("/messages", async (c) => {
	const rows = await getDb()
		.select()
		.from(messages)
		.orderBy(desc(messages.createdAt))
		.limit(100);
	return c.json(rows);
});

messageRoutes.post("/messages", async (c) => {
	const body = await readJsonBody(c);
	if (body === null) {
		return c.json({ error: "invalid JSON" }, 400);
	}
	const result = validateMessage(body);
	if (!result.ok) {
		return c.json({ error: "validation failed", errors: result.errors }, 400);
	}
	await getDb().insert(messages).values(result.data);
	return c.json({ ok: true }, 201);
});

messageRoutes.post("/messages/:id/heart", async (c) => {
	const id = c.req.param("id");
	if (!isValidMessageId(id)) {
		return c.json({ error: "id tidak valid, periksa kembali id pesan" }, 400);
	}
	await getDb()
		.update(messages)
		.set({ hearts: sql`${messages.hearts} + 1` })
		.where(eq(messages.id, id));
	return c.json({ ok: true });
});