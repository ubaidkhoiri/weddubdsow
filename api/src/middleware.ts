import type { Context, Next } from "hono";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimiter(max: number, windowMs: number) {
	return async (c: Context, next: Next) => {
		const now = Date.now();
		if (buckets.size > 10_000) {
			for (const [key, entry] of buckets) {
				if (entry.resetAt <= now) {
					buckets.delete(key);
				}
			}
		}
		const ip = c.req.header("cf-connecting-ip") ?? "unknown";
		const key = `${ip}:${c.req.path}`;
		const entry = buckets.get(key);
		if (!entry || entry.resetAt <= now) {
			buckets.set(key, { count: 1, resetAt: now + windowMs });
			return next();
		}
		entry.count += 1;
		if (entry.count > max) {
			return c.json({ error: "Too many requests" }, 429);
		}
		return next();
	};
}

export async function readJsonBody(c: Context): Promise<unknown> {
	try {
		return await c.req.json();
	} catch {
		return null;
	}
}