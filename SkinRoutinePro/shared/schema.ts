import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  allergies: jsonb("allergies").$type<string[]>().default([]),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  skinType: text("skin_type").notNull(),
  concerns: jsonb("concerns").$type<string[]>().notNull(),
  ageRange: text("age_range").notNull(),
  budget: text("budget").notNull(),
  timeAvailable: text("time_available").notNull(),
  lifestyle: jsonb("lifestyle").$type<Record<string, any>>().default({}),
});

export const routines = pgTable("routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  assessmentId: varchar("assessment_id").references(() => assessments.id).notNull(),
  name: text("name").notNull(),
  season: text("season").notNull(),
  preferenceType: text("preference_type").notNull(), // 'home-remedies' | 'products' | 'mixed'
  morningSteps: jsonb("morning_steps").$type<RoutineStep[]>().notNull(),
  eveningSteps: jsonb("evening_steps").$type<RoutineStep[]>().notNull(),
  isActive: boolean("is_active").default(true),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  skinTypes: jsonb("skin_types").$type<string[]>().notNull(),
  concerns: jsonb("concerns").$type<string[]>().notNull(),
  ingredients: jsonb("ingredients").$type<string[]>().notNull(),
  price: integer("price"), // in cents
  rating: integer("rating"), // 1-5
  isHomeRemedy: boolean("is_home_remedy").default(false),
  instructions: text("instructions"),
  warnings: jsonb("warnings").$type<string[]>().default([]),
});

export const ingredients = pgTable("ingredients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  benefits: jsonb("benefits").$type<string[]>().default([]),
  warnings: jsonb("warnings").$type<string[]>().default([]),
  safetyLevel: text("safety_level").notNull(), // 'safe' | 'caution' | 'warning'
  commonAllergens: jsonb("common_allergens").$type<string[]>().default([]),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  userId: true,
});

export const insertRoutineSchema = createInsertSchema(routines).omit({
  id: true,
  userId: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type Routine = typeof routines.$inferSelect;
export type InsertRoutine = z.infer<typeof insertRoutineSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;

// Additional types
export interface RoutineStep {
  stepNumber: number;
  title: string;
  description: string;
  products: Array<{
    id: string;
    name: string;
    type: 'home-remedy' | 'commercial';
    instructions?: string;
  }>;
  frequency?: string;
}

export interface SeasonalAdjustment {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  adjustments: Array<{
    stepTitle: string;
    modification: string;
    reason: string;
  }>;
}
