ALTER TABLE "authors" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "authors" ADD CONSTRAINT "authors_email_unique" UNIQUE("email");
