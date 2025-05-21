import {
  User,
  InsertUser,
  Game,
  InsertGame,
  Transaction,
  InsertTransaction,
  Leaderboard,
  InsertLeaderboard,
  GameType,
} from "@shared/schema";
import crypto from "crypto";

// IStorage interface with all the necessary CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, amount: number): Promise<User | undefined>;
  connectWallet(id: number, walletAddress: string): Promise<User | undefined>;

  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getGameById(id: number): Promise<Game | undefined>;
  getGamesByUserId(userId: number): Promise<Game[]>;
  getRecentGames(limit: number): Promise<Game[]>;
  getRecentWins(limit: number): Promise<Game[]>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getRecentTransactions(limit: number): Promise<Transaction[]>;

  // Leaderboard operations
  getLeaderboard(limit: number): Promise<Leaderboard[]>;
  updateLeaderboardEntry(userId: number, game: Game): Promise<Leaderboard | undefined>;
  getLeaderboardByUserId(userId: number): Promise<Leaderboard | undefined>;
  
  // Game verification
  generateServerSeed(): Promise<{ serverSeed: string; serverSeedHash: string }>;
  verifyGame(gameId: number, clientSeed: string, serverSeed: string, nonce: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private transactions: Map<number, Transaction>;
  private leaderboardEntries: Map<number, Leaderboard>;
  
  private userIdByWalletAddress: Map<string, number>;
  
  private userIdCounter: number;
  private gameIdCounter: number;
  private transactionIdCounter: number;
  private leaderboardIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.transactions = new Map();
    this.leaderboardEntries = new Map();
    
    this.userIdByWalletAddress = new Map();
    
    this.userIdCounter = 1;
    this.gameIdCounter = 1;
    this.transactionIdCounter = 1;
    this.leaderboardIdCounter = 1;
    
    // Create some initial data for demonstration purposes
    this.setupDemoData();
  }

  private setupDemoData() {
    // Create a demo user
    this.createUser({
      username: "demo",
      password: "password",
      walletAddress: "0x76a2...4f31",
      avatarColor: "primary",
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const userId = this.userIdByWalletAddress.get(walletAddress);
    if (userId) {
      return this.users.get(userId);
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, balance: 0 };
    this.users.set(id, user);
    
    // Add to wallet index if it has a wallet address
    if (user.walletAddress) {
      this.userIdByWalletAddress.set(user.walletAddress, id);
    }
    
    return user;
  }

  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    user.balance = Math.max(0, user.balance + amount);
    this.users.set(id, user);
    
    return user;
  }

  async connectWallet(id: number, walletAddress: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // Remove old wallet address reference if it exists
    if (user.walletAddress) {
      this.userIdByWalletAddress.delete(user.walletAddress);
    }
    
    user.walletAddress = walletAddress;
    this.users.set(id, user);
    this.userIdByWalletAddress.set(walletAddress, id);
    
    return user;
  }

  // Game operations
  async createGame(game: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const timestamp = new Date();
    const newGame: Game = { ...game, id, timestamp };
    this.games.set(id, newGame);
    
    // Update leaderboard
    await this.updateLeaderboardEntry(game.userId, newGame);
    
    return newGame;
  }

  async getGameById(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGamesByUserId(userId: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRecentGames(limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getRecentWins(limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.isWin)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const timestamp = new Date();
    const newTransaction: Transaction = { ...transaction, id, timestamp };
    this.transactions.set(id, newTransaction);
    
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRecentTransactions(limit: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Leaderboard operations
  async getLeaderboard(limit: number): Promise<Leaderboard[]> {
    return Array.from(this.leaderboardEntries.values())
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, limit);
  }

  async getLeaderboardByUserId(userId: number): Promise<Leaderboard | undefined> {
    return Array.from(this.leaderboardEntries.values())
      .find(entry => entry.userId === userId);
  }

  async updateLeaderboardEntry(userId: number, game: Game): Promise<Leaderboard | undefined> {
    // Get or create a leaderboard entry for this user
    let entry = await this.getLeaderboardByUserId(userId);
    
    if (!entry) {
      const id = this.leaderboardIdCounter++;
      entry = {
        id,
        userId,
        totalWagered: 0,
        totalWinnings: 0,
        netProfit: 0,
        gamesPlayed: 0,
        favoriteGame: undefined,
        lastUpdated: new Date(),
      };
    }
    
    // Update entry stats
    entry.totalWagered += game.bet;
    entry.totalWinnings += game.winnings;
    entry.netProfit = entry.totalWinnings - entry.totalWagered;
    entry.gamesPlayed += 1;
    entry.lastUpdated = new Date();
    
    // Track favorite game
    const gameTypeCounts = new Map<GameType, number>();
    const userGames = await this.getGamesByUserId(userId);
    
    userGames.forEach(g => {
      const count = gameTypeCounts.get(g.type as GameType) || 0;
      gameTypeCounts.set(g.type as GameType, count + 1);
    });
    
    let maxCount = 0;
    let favoriteGame: GameType | undefined = undefined;
    
    gameTypeCounts.forEach((count, gameType) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteGame = gameType;
      }
    });
    
    entry.favoriteGame = favoriteGame;
    
    // Save the updated entry
    this.leaderboardEntries.set(entry.id, entry);
    
    return entry;
  }

  // Game verification methods
  async generateServerSeed(): Promise<{ serverSeed: string; serverSeedHash: string }> {
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverSeedHash = crypto
      .createHash('sha256')
      .update(serverSeed)
      .digest('hex');
    
    return { serverSeed, serverSeedHash };
  }

  async verifyGame(gameId: number, clientSeed: string, serverSeed: string, nonce: number): Promise<boolean> {
    const game = await this.getGameById(gameId);
    if (!game) return false;
    
    // Verify the server seed hash is correct
    const hash = crypto
      .createHash('sha256')
      .update(serverSeed)
      .digest('hex');
    
    if (hash !== game.serverSeedHash) return false;
    
    // Verify the other game parameters
    if (
      game.clientSeed !== clientSeed ||
      game.serverSeed !== serverSeed ||
      game.nonce !== nonce
    ) {
      return false;
    }
    
    return true;
  }
}

export const storage = new MemStorage();
