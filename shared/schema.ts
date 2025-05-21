import { pgTable, text, serial, integer, boolean, jsonb, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").unique(),
  avatarColor: text("avatar_color"),
  balance: doublePrecision("balance").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  avatarColor: true,
});

export const gameTypes = [
  "slots", 
  "dice", 
  "coinflip", 
  "crash"
] as const;

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type", { enum: gameTypes }).notNull(),
  bet: doublePrecision("bet").notNull(),
  winnings: doublePrecision("winnings").notNull(),
  multiplier: doublePrecision("multiplier").notNull(),
  clientSeed: text("client_seed").notNull(),
  serverSeed: text("server_seed").notNull(),
  serverSeedHash: text("server_seed_hash").notNull(),
  nonce: integer("nonce").notNull(),
  result: jsonb("result").notNull(),
  isWin: boolean("is_win").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertGameSchema = createInsertSchema(games).pick({
  userId: true,
  type: true,
  bet: true,
  winnings: true,
  multiplier: true,
  clientSeed: true,
  serverSeed: true,
  serverSeedHash: true,
  nonce: true,
  result: true,
  isWin: true,
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  type: text("type", { enum: ["deposit", "withdrawal", "win", "loss"] }).notNull(),
  gameId: integer("game_id"),
  walletAddress: text("wallet_address"),
  hash: text("hash"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  gameId: true,
  walletAddress: true,
  hash: true,
});

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  totalWagered: doublePrecision("total_wagered").default(0).notNull(),
  totalWinnings: doublePrecision("total_winnings").default(0).notNull(),
  netProfit: doublePrecision("net_profit").default(0).notNull(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  favoriteGame: text("favorite_game", { enum: gameTypes }),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).pick({
  userId: true,
  totalWagered: true,
  totalWinnings: true,
  netProfit: true,
  gamesPlayed: true,
  favoriteGame: true,
});

// Create a game verification request schema
export const gameVerificationSchema = z.object({
  clientSeed: z.string(),
  serverSeed: z.string(),
  nonce: z.number(),
  gameType: z.enum(gameTypes),
});

// Create a wallet connection schema
export const walletConnectionSchema = z.object({
  walletAddress: z.string(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type GameType = typeof gameTypes[number];

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type Leaderboard = typeof leaderboard.$inferSelect;

export type GameVerification = z.infer<typeof gameVerificationSchema>;
export type WalletConnection = z.infer<typeof walletConnectionSchema>;
