import { pgTable, text, varchar, timestamp, boolean, integer, decimal, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Users table for authentication
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  dateOfBirth: timestamp("date_of_birth"),
  bio: text("bio"),
  location: varchar("location", { length: 200 }),
  website: varchar("website", { length: 255 }),
  twitter: varchar("twitter", { length: 100 }),
  profileImage: text("profile_image"),
  isEmailVerified: boolean("is_email_verified").default(false),
  isActive: boolean("is_active").default(true),
  role: varchar("role", { length: 20 }).default("user"), // user, admin, premium
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
}));

// Email verification tokens
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  token: text("token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  token: text("token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User sessions for JWT refresh tokens
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull().unique(),
  deviceInfo: text("device_info"),
  ipAddress: varchar("ip_address", { length: 45 }),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
  refreshTokenIdx: index("sessions_refresh_token_idx").on(table.refreshToken),
}));

// User preferences
export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  theme: varchar("theme", { length: 20 }).default("light"), // light, dark, system
  currency: varchar("currency", { length: 3 }).default("USD"),
  language: varchar("language", { length: 5 }).default("en"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  notifications: jsonb("notifications").default({
    email: true,
    push: true,
    priceAlerts: true,
    newsAlerts: false,
    soundAlerts: true,
    alertFrequency: "immediate"
  }),
  tradingPreferences: jsonb("trading_preferences").default({
    defaultOrderType: "market",
    confirmOrders: true,
    showAdvancedCharts: false,
    defaultLeverage: 1,
    riskWarnings: true,
    paperTrading: false,
    showGrid: true,
    showVolume: true,
    fontSize: 14,
    chartHeight: 400,
    colorScheme: "default"
  }),
  accessibilitySettings: jsonb("accessibility_settings").default({
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNav: true,
    focusIndicators: true
  }),
  privacySettings: jsonb("privacy_settings").default({
    shareData: false,
    analytics: true,
    cookies: true,
    twoFactor: false
  }),
  dataSettings: jsonb("data_settings").default({
    dataRetention: "1year",
    autoSync: true,
    exportFormat: "json",
    apiAccess: false
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Watchlists
export const watchlists = pgTable("watchlists", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("watchlists_user_id_idx").on(table.userId),
}));

// Watchlist items
export const watchlistItems = pgTable("watchlist_items", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  watchlistId: text("watchlist_id").notNull().references(() => watchlists.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  exchange: varchar("exchange", { length: 20 }),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => ({
  watchlistIdIdx: index("watchlist_items_watchlist_id_idx").on(table.watchlistId),
  symbolIdx: index("watchlist_items_symbol_idx").on(table.symbol),
}));

// Price alerts
export const priceAlerts = pgTable("price_alerts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  exchange: varchar("exchange", { length: 20 }),
  alertType: varchar("alert_type", { length: 20 }).notNull(), // above, below, percentage_change
  targetPrice: decimal("target_price", { precision: 20, scale: 8 }),
  percentageChange: decimal("percentage_change", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  isTriggered: boolean("is_triggered").default(false),
  triggeredAt: timestamp("triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  userIdIdx: index("price_alerts_user_id_idx").on(table.userId),
  symbolIdx: index("price_alerts_symbol_idx").on(table.symbol),
}));

// Trading accounts (for future trading functionality)
export const tradingAccounts = pgTable("trading_accounts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountType: varchar("account_type", { length: 20 }).notNull(), // demo, live
  exchangeName: varchar("exchange_name", { length: 50 }).notNull(),
  accountName: varchar("account_name", { length: 100 }),
  apiKey: text("api_key"), // encrypted
  apiSecret: text("api_secret"), // encrypted
  isActive: boolean("is_active").default(true),
  balance: jsonb("balance").default({}), // currency -> amount mapping
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("trading_accounts_user_id_idx").on(table.userId),
}));

// User activity logs
export const userActivityLogs = pgTable("user_activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("activity_logs_user_id_idx").on(table.userId),
  actionIdx: index("activity_logs_action_idx").on(table.action),
  createdAtIdx: index("activity_logs_created_at_idx").on(table.createdAt),
}));

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type Watchlist = typeof watchlists.$inferSelect;
export type NewWatchlist = typeof watchlists.$inferInsert;
export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type NewWatchlistItem = typeof watchlistItems.$inferInsert;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type NewPriceAlert = typeof priceAlerts.$inferInsert;
export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type NewTradingAccount = typeof tradingAccounts.$inferInsert;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type NewUserActivityLog = typeof userActivityLogs.$inferInsert;