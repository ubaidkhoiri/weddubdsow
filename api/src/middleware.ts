import type { Context, Next } from "hono";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function getClientIp(c: Context): string {
	const cf = c.req.header("cf-connecting-ip")?.trim();
	if (cf) return cf;
	const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
	if (forwarded) return forwarded;
	const real = c.req.header("x-real-ip")?.trim();
	if (real) return real;
	return "unknown";
}

export function rateLimiter(max: number, windowMs: number) {
	return async (c: Context, next: Next) => {
		const now = Date.now();
		if (buckets.size > 10_000) {
			for (const [key, entry] of buckets) {
				if (entry.resetAt <= now) {
					buckets.delete(key);
				}
			}
			for (const key of buckets.keys()) {
				if (buckets.size <= 10_000) break;
				buckets.delete(key);
			}
		}
		const key = `${getClientIp(c)}:${c.req.path}`;
		const entry = buckets.get(key);
		if (!entry || entry.resetAt <= now) {
			buckets.set(key, { count: 1, resetAt: now + windowMs });
			return next();
		}
		entry.count += 1;
		if (entry.count > max) {
			const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
			c.header("Retry-After", String(retryAfter));
			return c.json({ error: `Too many requests, coba lagi setelah ${retryAfter} detik` }, 429);
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