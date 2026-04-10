import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  regNumber: text("reg_number").notNull().unique(),
  level: text("level").notNull(), // bachelor | masters | phd
  department: text("department").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // student | admin
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => users.id),
  type: text("type").notNull(), // proposal | result | presentation | publication
  title: text("title").notNull(),
  description: text("description").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  status: text("status").notNull().default("pending"), // pending | approved | revision | rejected
  currentStage: text("current_stage").notNull().default("department"), // department | faculty | board
  score: real("score"),
  reviewerComment: text("reviewer_comment"),
  submittedAt: text("submitted_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const stageReviews = sqliteTable("stage_reviews", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull().references(() => submissions.id),
  stage: text("stage").notNull(), // department | faculty | board
  status: text("status").notNull().default("pending"), // pending | approved | revision | rejected
  score: real("score"),
  comment: text("comment"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  recipientId: text("recipient_id"), // null = broadcast to all
  senderId: text("sender_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  recipientId: text("recipient_id").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Message = typeof messages.$inferSelect;
