import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { settings } from "../schema";

export const VERSIONS = ["v1", "v2"] as const;
export type ActiveVersion = (typeof VERSIONS)[number];

export const ACTIVE_VERSION_KEY = "active_version";
export const DEFAULT_VERSION: ActiveVersion = "v2";

export function isActiveVersion(value: unknown): value is ActiveVersion {
	return value === "v1" || value === "v2";
}

export async function getActiveVersion(): Promise<ActiveVersion> {
	try {
		const rows = await getDb()
			.select()
			.from(settings)
			.where(eq(settings.key, ACTIVE_VERSION_KEY))
			.limit(1);
		const value = rows[0]?.value;
		return isActiveVersion(value) ? value : DEFAULT_VERSION;
	} catch {
		return DEFAULT_VERSION;
	}
}

export async function setActiveVersion(version: ActiveVersion): Promise<void> {
	const existing = await getDb()
		.select()
		.from(settings)
		.where(eq(settings.key, ACTIVE_VERSION_KEY))
		.limit(1);
	if (existing.length === 0) {
		await getDb()
			.insert(settings)
			.values({ key: ACTIVE_VERSION_KEY, value: version });
		return;
	}
	await getDb()
		.update(settings)
		.set({ value: version })
		.where(eq(settings.key, ACTIVE_VERSION_KEY));
}

export const versionRoutes = new Hono();

versionRoutes.get("/version", async (c) => {
	return c.json({ version: await getActiveVersion() });
});
