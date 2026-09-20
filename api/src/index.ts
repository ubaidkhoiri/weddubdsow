import { Hono } from "hono";
import { messageRoutes } from "./routes/messages";
import { rsvpRoutes } from "./routes/rsvp";

const app = new Hono();

app.use("/api/*", async (c, next) => {
	const origin = c.req.header("Origin");
	if (
		origin &&
		(origin === "http://localhost:5173" || origin.endsWith(".workers.dev"))
	) {
		c.header("Access-Control-Allow-Origin", origin);
		c.header("Vary", "Origin");
		c.header("Access-Control-Allow-Headers", "Content-Type");
		c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	}
	if (c.req.method === "OPTIONS") {
		return c.newResponse(null, 204);
	}
	await next();
});

app.get("/api/health", (c) => {
	return c.json({ ok: true });
});

app.route("/api", rsvpRoutes);
app.route("/api", messageRoutes);

export default app;