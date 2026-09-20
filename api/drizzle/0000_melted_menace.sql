CREATE TYPE "public"."attendance" AS ENUM('yes', 'no', 'maybe');--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"attendance" "attendance" NOT NULL,
	"guests" integer DEFAULT 1 NOT NULL,
	"phone" text,
	"created_at" text DEFAULT (now())::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"message" text NOT NULL,
	"hearts" integer DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT (now())::text NOT NULL
);
