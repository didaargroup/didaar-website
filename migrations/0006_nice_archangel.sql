DROP INDEX "invitations_code_unique";--> statement-breakpoint
DROP INDEX "page_translations_page_id_locale_unique";--> statement-breakpoint
DROP INDEX "pages_slug_unique";--> statement-breakpoint
DROP INDEX "sessions_user_id_idx";--> statement-breakpoint
DROP INDEX "sessions_expires_at_idx";--> statement-breakpoint
DROP INDEX "users_github_id_unique";--> statement-breakpoint
ALTER TABLE `page_translations` ALTER COLUMN "content" TO "content" text;--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_code_unique` ON `invitations` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `page_translations_page_id_locale_unique` ON `page_translations` (`page_id`,`locale`);--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_github_id_unique` ON `users` (`github_id`);--> statement-breakpoint
ALTER TABLE `page_translations` ADD `published` integer DEFAULT false NOT NULL;