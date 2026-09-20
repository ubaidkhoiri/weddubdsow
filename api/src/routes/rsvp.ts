import { Hono } from "hono";
import { getDb } from "../db";
import { guests } from "../schema";
import { rateLimiter, readJsonBody } from "../middleware";
import { validateRsvp } from "../lib/validate";

export const rsvpRoutes = new Hono();

rsvpRoutes.use("/rsvp", rateLimiter(30, 60_000));

rsvpRoutes.post("/rsvp", async (c) => {
	const body = await readJsonBody(c);
	if (body === null) {
		return c.json({ error: "invalid JSON" }, 400);
	}
	const result = validateRsvp(body);
	if (!result.ok) {
		return c.json({ error: "validation failed", errors: result.errors }, 400);
	}
	await getDb().insert(guests).values({
		name: result.data.name,
		attendance: result.data.attendance,
		guests: result.data.guests,
		phone: result.data.phone ?? null,
	});
	return c.json({ ok: true }, 201);
});