import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').unique().notNull(),
  password_hash: text('password_hash').notNull(),
  name: text('name'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  plan_id: text('plan_id'),
  status: text('status').default('active').notNull(),
  stripe_subscription_id: text('stripe_subscription_id').unique(),
  current_period_start: integer('current_period_start', { mode: 'timestamp' }),
  current_period_end: integer('current_period_end', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
});

export const credits = sqliteTable('credits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  amount: integer('amount').default(0).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export const restorations = sqliteTable('restorations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  status: text('status').default('processing').notNull(),
  input_file_url: text('input_file_url'),
  result_urls: text('result_urls'), // JSON string
  algorithm: text('algorithm'),
  parameters: text('parameters'), // JSON string
  error_message: text('error_message'), // Error message when restoration fails
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  completed_at: integer('completed_at', { mode: 'timestamp' }),
});

export const gallery_items = sqliteTable('gallery_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  restoration_id: integer('restoration_id').references(() => restorations.id),
  title: text('title'),
  description: text('description'),
  category: text('category'),
  image_url: text('image_url'),
  is_public: integer('is_public', { mode: 'boolean' }).default(false).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});
