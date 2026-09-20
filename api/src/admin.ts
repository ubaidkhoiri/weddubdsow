import type { Context, MiddlewareHandler } from "hono";

export const ADMIN_COOKIE = "weddu_admin";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const encoder = new TextEncoder();

async function hmacKey(): Promise<CryptoKey> {
	const secret = process.env.ADMIN_PASSWORD;
	if (!secret) {
		throw new Error("ADMIN_PASSWORD is not set");
	}
	return crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
}

async function sha256Hex(value: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
}

export function timingSafePassword(a: string, b: string): Promise<boolean> {
	return Promise.all([sha256Hex(a), sha256Hex(b)]).then(([ha, hb]) =>
		timingSafeEqualHex(ha, hb),
	);
}

function toBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (let i = 0; i < bytes.length; i += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	}
	return btoa(binary)
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
	const padded = value.replaceAll("-", "+").replaceAll("_", "/");
	const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
	const binary = atob(padded + pad);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export async function signAdminToken(): Promise<{ token: string; expires: number }> {
	const payload = base64url(payloadJson());
	const expires = Date.now() + TOKEN_TTL_MS;
	return { token: await sign(`${payload}.${expires}`), expires };
}

function base64url(value: string): string {
	return toBase64Url(encoder.encode(value));
}

function payloadJson(): string {
	return JSON.stringify({ role: "admin" });
}

async function sign(data: string): Promise<string> {
	const sig = await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(data));
	return `${data}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyAdminToken(cookie?: string): Promise<boolean> {
	if (!cookie) {
		return false;
	}
	const parts = cookie.split(".");
	if (parts.length !== 3) {
		return false;
	}
	const [payloadB64, expiryRaw, sigB64] = parts;
	const expiry = Number(expiryRaw);
	if (!Number.isFinite(expiry) || expiry <= Date.now()) {
		return false;
	}
	const expected = await sign(`${payloadB64}.${expiryRaw}`);
	const expectedSig = expected.split(".")[2];
	if (
		!timingSafeEqualHex(sigB64, expectedSig) ||
		toBase64Url(encoder.encode(payloadJson())) !== payloadB64
	) {
		return false;
	}
	return true;
}

export function requireAdmin(): MiddlewareHandler {
	return async (c, next) => {
		const cookie = c.req.header("cookie") ?? "";
		const value = cookie
			.split(";")
			.map((part) => part.trim())
			.find((part) => part.startsWith(`${ADMIN_COOKIE}=`))
			?.slice(ADMIN_COOKIE.length + 1);
		const valid = await verifyAdminToken(value ? decodeURIComponent(value) : undefined);
		if (!valid) {
			return c.json({ error: "Tidak sah" }, 401);
		}
		await next();
	};
}

export function isSecureRequest(c: Context): boolean {
	return c.req.url.startsWith("https://");
}

export function adminCookieOptions(secure: boolean) {
	return {
		httpOnly: true,
		secure,
		sameSite: "Lax" as const,
		path: "/",
		maxAge: TOKEN_TTL_MS / 1000,
	};
}