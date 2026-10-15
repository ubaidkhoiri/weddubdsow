CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
INSERT INTO "settings" ("key", "value") VALUES ('active_version', 'v2')
ON CONFLICT ("key") DO NOTHING;
