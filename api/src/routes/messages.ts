import { Hono } from "hono";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { messages } from "../schema";
import { rateLimiter, readJsonBody } from "../middleware";
import { validateMessage } from "../lib/validate";

export const messageRoutes = new Hono();

messageRoutes.use("/messages", rateLimiter(30, 60_000));

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
	await getDb()
		.update(messages)
		.set({ hearts: sql`${messages.hearts} + 1` })
		.where(eq(messages.id, c.req.param("id")));
	return c.json({ ok: true });
});