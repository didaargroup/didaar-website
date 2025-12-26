import { sqliteTable, text, integer, index, unique, AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  githubId: integer("github_id").notNull().unique(),
  username: text("username").notNull(),
  invitationAcceptedAt: integer("invitation_accepted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .$type<number>(), // Add type annotation
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
}, (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
]);

export const invitations = sqliteTable("invitations", {
  id: integer("id").primaryKey(),
  code: text("code").notNull().unique(),
  createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedBy: integer("used_by").references(() => users.id, { onDelete: "set null" }),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const pages = sqliteTable("pages", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  isDraft: integer("is_draft", { mode: "boolean" }).notNull().default(false),
  showOnMenu: integer("show_on_menu", { mode: "boolean" }).notNull().default(true),
  parentId: integer("parent_id").references((): AnySQLiteColumn => pages.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const pageTranslations = sqliteTable("page_translations", {
  pageId: integer("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
  locale: text("locale").notNull(),
  title: text("title").notNull(),
  content: text("content", { mode: "json" }),  // json content for pucked
  published: integer("published", { mode: "boolean" }).notNull().default(false),
}, (table) => [
  unique().on(table.pageId, table.locale),
]);

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  createdInvitations: many(invitations),
  usedInvitations: many(invitations),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const invitationRelations = relations(invitations, ({ one }) => ({
  createdByUser: one(users, {
    fields: [invitations.createdBy],
    references: [users.id],
  }),
  usedByUser: one(users, {
    fields: [invitations.usedBy],
    references: [users.id],
  }),
}));

export const pageRelations = relations(pages, ({ one, many }) => ({
  translations: many(pageTranslations),
  parent: one(pages, {
    fields: [pages.parentId],
    references: [pages.id],
  }),
  children: many(pages),
}));

export const pageTranslationRelations = relations(pageTranslations, ({ one }) => ({
  page: one(pages, {
    fields: [pageTranslations.pageId],
    references: [pages.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type PageTranslation = typeof pageTranslations.$inferSelect;
export type NewPageTranslation = typeof pageTranslations.$inferInsert;
