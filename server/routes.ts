import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertGameSchema, 
  gameVerificationSchema, 
  walletConnectionSchema,
  gameTypes 
} from "@shared/schema";
import crypto from "crypto";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the blockchain casino
  const httpServer = createServer(app);

  // Error handling middleware
  const handleApiError = (err: any, res: Response) => {
    console.error("API Error:", err);
    
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ 
        message: validationError.message,
        errors: err.errors
      });
    }
    
    return res.status(500).json({ message: err.message || "Internal server error" });
  };

  // User registration
  app.post("/api/users/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Wallet connection
  app.post("/api/wallet/connect", async (req: Request, res: Response) => {
    try {
      const { walletAddress } = walletConnectionSchema.parse(req.body);
      
      // Check if this wallet is already connected to a user
      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        // Create a new user with this wallet address
        const username = `player_${randomBytes(4).toString('hex')}`;
        const password = randomBytes(16).toString('hex');
        const avatarColor = ["primary", "secondary", "accent", "warning", "danger"][
          Math.floor(Math.random() * 5)
        ];
        
        user = await storage.createUser({
          username,
          password,
          walletAddress,
          avatarColor
        });
      }
      
      res.status(200).json({
        user,
        message: "Wallet connected successfully"
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Get user by wallet address
  app.get("/api/users/wallet/:address", async (req: Request, res: Response) => {
    try {
      const walletAddress = req.params.address;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(user);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Get user profile
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user stats
      const games = await storage.getGamesByUserId(userId);
      const transactions = await storage.getTransactionsByUserId(userId);
      const leaderboard = await storage.getLeaderboardByUserId(userId);
      
      res.status(200).json({
        user,
        stats: {
          gamesPlayed: games.length,
          wins: games.filter(game => game.isWin).length,
          totalWagered: games.reduce((total, game) => total + game.bet, 0),
          totalWinnings: games.filter(game => game.isWin)
            .reduce((total, game) => total + game.winnings, 0),
          leaderboardPosition: leaderboard ? 
            (await storage.getLeaderboard(100))
              .findIndex(entry => entry.userId === userId) + 1 : null
        },
        recentGames: games.slice(0, 10),
        recentTransactions: transactions.slice(0, 10)
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Generate server seed
  app.get("/api/games/seed", async (_req: Request, res: Response) => {
    try {
      const { serverSeed, serverSeedHash } = await storage.generateServerSeed();
      res.status(200).json({ serverSeedHash, serverSeed });
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Play a game
  app.post("/api/games/play", async (req: Request, res: Response) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      
      // Get the user
      const user = await storage.getUser(gameData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if the user has enough balance
      if (user.balance < gameData.bet) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Update the user's balance (subtract bet amount)
      await storage.updateUserBalance(user.id, -gameData.bet);
      
      // Create the game record
      const game = await storage.createGame(gameData);
      
      // Create transaction record for the bet
      await storage.createTransaction({
        userId: user.id,
        amount: -gameData.bet,
        type: "loss",
        gameId: game.id,
        walletAddress: user.walletAddress
      });
      
      // If the game is a win, add the winnings to the user's balance
      if (game.isWin && game.winnings > 0) {
        await storage.updateUserBalance(user.id, game.winnings);
        
        // Create transaction record for the win
        await storage.createTransaction({
          userId: user.id,
          amount: game.winnings,
          type: "win",
          gameId: game.id,
          walletAddress: user.walletAddress
        });
      }
      
      // Get updated user
      const updatedUser = await storage.getUser(user.id);
      
      res.status(200).json({
        game,
        user: updatedUser
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Verify game fairness
  app.post("/api/games/verify", async (req: Request, res: Response) => {
    try {
      const { clientSeed, serverSeed, nonce, gameType } = gameVerificationSchema.parse(req.body);
      
      // Calculation depends on game type
      let result;
      
      // Generate the combined seed
      const combinedSeed = `${clientSeed}-${serverSeed}-${nonce}`;
      const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
      
      switch (gameType) {
        case "dice":
          // Dice result is 0-100 based on first 8 characters of hash converted to decimal
          result = {
            roll: parseInt(hash.slice(0, 8), 16) % 101
          };
          break;
        
        case "coinflip":
          // Coin flip result is 0 (tails) or 1 (heads) based on first character of hash
          result = {
            side: parseInt(hash.slice(0, 1), 16) % 2 === 0 ? "tails" : "heads"
          };
          break;
        
        case "slots":
          // Slots result is an array of 3 numbers 0-9 based on different parts of the hash
          const slot1 = parseInt(hash.slice(0, 2), 16) % 10;
          const slot2 = parseInt(hash.slice(2, 4), 16) % 10;
          const slot3 = parseInt(hash.slice(4, 6), 16) % 10;
          result = {
            reels: [slot1, slot2, slot3]
          };
          break;
        
        case "crash":
          // Crash result is a multiplier based on the hash
          // Using a simple algorithm for demo: 
          // 1 + (first 13 hex digits converted to float between 0 and 1) / 0.04
          const hexValue = hash.slice(0, 13);
          const decimalValue = parseInt(hexValue, 16) / 0xfffffffffffff;
          
          // If decimalValue < 0.04, the game will crash at 1x
          const crashPoint = decimalValue < 0.04 ? 1 : 
            Math.floor((100 * (1 / (1 - decimalValue / 25))) / 100);
          
          result = {
            crashPoint
          };
          break;
        
        default:
          return res.status(400).json({ message: "Invalid game type" });
      }
      
      res.status(200).json({
        clientSeed,
        serverSeed,
        nonce,
        hash,
        gameType,
        result
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Get user games history
  app.get("/api/games/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const games = await storage.getGamesByUserId(userId);
      res.status(200).json(games);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Get recent games
  app.get("/api/games/recent", async (_req: Request, res: Response) => {
    try {
      const recentGames = await storage.getRecentGames(20);
      res.status(200).json(recentGames);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Get recent wins
  app.get("/api/games/wins", async (_req: Request, res: Response) => {
    try {
      const recentWins = await storage.getRecentWins(10);
      res.status(200).json(recentWins);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (_req: Request, res: Response) => {
    try {
      const leaderboard = await storage.getLeaderboard(50);
      
      // Enrich with user data
      const enrichedLeaderboard = await Promise.all(
        leaderboard.map(async entry => {
          const user = await storage.getUser(entry.userId);
          return {
            ...entry,
            user: user ? {
              username: user.username,
              walletAddress: user.walletAddress,
              avatarColor: user.avatarColor
            } : null
          };
        })
      );
      
      res.status(200).json(enrichedLeaderboard);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Get stats for the home page
  app.get("/api/stats", async (_req: Request, res: Response) => {
    try {
      const recentGames = await storage.getRecentGames(100);
      const recentWins = await storage.getRecentWins(10);
      const leaderboard = await storage.getLeaderboard(5);
      
      // Enrich the leaderboard with user data
      const enrichedLeaderboard = await Promise.all(
        leaderboard.map(async entry => {
          const user = await storage.getUser(entry.userId);
          return {
            ...entry,
            user: user ? {
              username: user.username,
              walletAddress: user.walletAddress,
              avatarColor: user.avatarColor
            } : null
          };
        })
      );
      
      // Calculate the stats
      const totalWagered = recentGames.reduce((sum, game) => sum + game.bet, 0);
      const activePlayers = new Set(recentGames.map(game => game.userId)).size;
      
      // Random jackpot amount (for demo only)
      const jackpot = Math.floor(1000 + Math.random() * 5000);
      
      // Random online players (for demo only)
      const playersOnline = Math.floor(200 + Math.random() * 300);
      
      res.status(200).json({
        totalWagered,
        activePlayers,
        recentWins,
        enrichedLeaderboard,
        jackpot,
        playersOnline
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Get list of all game types
  app.get("/api/games/types", (_req: Request, res: Response) => {
    res.status(200).json(gameTypes);
  });

  return httpServer;
}
