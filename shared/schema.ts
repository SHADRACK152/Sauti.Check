import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  location: text("location").default("Kenya"),
  role: text("role").notNull().default("user"), // user, admin
  articlesRead: integer("articles_read").default(0),
  factsChecked: integer("facts_checked").default(0),
  bookmarksCount: integer("bookmarks_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // Politics, Economy, Education, Health, Infrastructure
  source: text("source").notNull(),
  author: text("author"),
  imageUrl: text("image_url"),
  verified: boolean("verified").default(true),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const civicAlerts = pgTable("civic_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, urgent
  category: text("category").notNull(),
  actionText: text("action_text"),
  actionUrl: text("action_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // full-time, part-time, contract, internship
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  salary: text("salary"),
  applicationUrl: text("application_url"),
  postedAt: timestamp("posted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const factChecks = pgTable("fact_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  text: text("text").notNull(),
  result: text("result").notNull(), // true, false, partly-true, unverified
  confidence: integer("confidence").notNull(), // 0-100
  explanation: text("explanation"),
  sources: jsonb("sources"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  articlesRead: true,
  factsChecked: true,
  bookmarksCount: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export const insertCivicAlertSchema = createInsertSchema(civicAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  postedAt: true,
});

export const insertFactCheckSchema = createInsertSchema(factChecks).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const factCheckRequestSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters long"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type CivicAlert = typeof civicAlerts.$inferSelect;
export type InsertCivicAlert = z.infer<typeof insertCivicAlertSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type FactCheck = typeof factChecks.$inferSelect;
export type InsertFactCheck = z.infer<typeof insertFactCheckSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type FactCheckRequest = z.infer<typeof factCheckRequestSchema>;
