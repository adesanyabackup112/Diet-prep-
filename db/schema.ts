import { pgTable, text, timestamp, integer, real, varchar, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  age: integer('age'),
  weight: real('weight'), // in kg
  height: real('height'), // in cm
  targetWeight: real('target_weight'), // in kg
  activityLevel: varchar('activity_level', { length: 50 }), // sedentary, light, moderate, active, very_active
  goal: varchar('goal', { length: 50 }), // lose, maintain, gain
  dailyCalories: integer('daily_calories'), // calculated target
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Meals table
export const meals = pgTable('meals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  mealType: varchar('meal_type', { length: 50 }).notNull(), // breakfast, lunch, dinner, snack
  calories: integer('calories').notNull(),
  protein: real('protein'),
  carbs: real('carbs'),
  fat: real('fat'),
  scheduledAt: timestamp('scheduled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Food logs table
export const foodLogs = pgTable('food_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  foodName: varchar('food_name', { length: 255 }).notNull(),
  calories: integer('calories').notNull(),
  protein: real('protein'),
  carbs: real('carbs'),
  fat: real('fat'),
  servingSize: varchar('serving_size', { length: 100 }),
  mealType: varchar('meal_type', { length: 50 }).notNull(), // breakfast, lunch, dinner, snack
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Planned meals table - for meal planning calendar
export const plannedMeals = pgTable('planned_meals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  mealType: varchar('meal_type', { length: 50 }).notNull(), // breakfast, lunch, dinner, snack
  calories: integer('calories'),
  protein: real('protein'),
  carbs: real('carbs'),
  fat: real('fat'),
  plannedDate: timestamp('planned_date').notNull(), // the date this meal is planned for
  isCompleted: integer('is_completed').default(0), // 0 = not completed, 1 = completed/logged
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  meals: many(meals),
  foodLogs: many(foodLogs),
  plannedMeals: many(plannedMeals),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.id],
  }),
}));

export const foodLogsRelations = relations(foodLogs, ({ one }) => ({
  user: one(users, {
    fields: [foodLogs.userId],
    references: [users.id],
  }),
}));

export const plannedMealsRelations = relations(plannedMeals, ({ one }) => ({
  user: one(users, {
    fields: [plannedMeals.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
export type FoodLog = typeof foodLogs.$inferSelect;
export type NewFoodLog = typeof foodLogs.$inferInsert;
export type PlannedMeal = typeof plannedMeals.$inferSelect;
export type NewPlannedMeal = typeof plannedMeals.$inferInsert;
