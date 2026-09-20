import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const attendanceEnum = pgEnum("attendance", ["yes", "no", "maybe"]);

export const guests = pgTable("guests", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	attendance: attendanceEnum("attendance").notNull(),
	guests: integer("guests").notNull().default(1),
	phone: text("phone"),
	createdAt: text("created_at").notNull().default(sql`(now())::text`),
});

export const messages = pgTable("messages", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	message: text("message").notNull(),
	hearts: integer("hearts").notNull().default(0),
	createdAt: text("created_at").notNull().default(sql`(now())::text`),
});