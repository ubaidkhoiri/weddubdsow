import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not set");
	}
	if (!cached) {
		const client = neon(process.env.DATABASE_URL);
		cached = drizzle(client, { schema });
	}
	return cached;
}