// Serverless function for Vercel deployment
import express from 'express';
import { storage } from '../server/storage.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// API Routes
app.get('/api/stats', async (req, res) => {
  try {
    const totalWagered = 0;
    const activePlayers = 0;
    const recentWins = [];
    
    res.json({ totalWagered, activePlayers, recentWins });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.get('/api/games/types', async (req, res) => {
  res.json(["slots", "dice", "coinflip", "crash"]);
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await storage.getLeaderboard(10);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

app.get('/api/games/wins', async (req, res) => {
  try {
    const wins = await storage.getRecentWins(10);
    res.json(wins);
  } catch (error) {
    console.error('Error getting recent wins:', error);
    res.status(500).json({ error: 'Failed to get recent wins' });
  }
});

app.get('/api/games/seed', async (req, res) => {
  try {
    const { serverSeedHash } = await storage.generateServerSeed();
    res.json({ serverSeedHash });
  } catch (error) {
    console.error('Error generating seed:', error);
    res.status(500).json({ error: 'Failed to generate seed' });
  }
});

app.post('/api/wallet/connect', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Check if user exists with this wallet address
    let user = await storage.getUserByWalletAddress(walletAddress);
    
    if (!user) {
      // Create new user with random username
      const randomUsername = `user_${Math.floor(Math.random() * 10000)}`;
      user = await storage.createUser({
        username: randomUsername,
        password: 'password123', // This is just a placeholder
        walletAddress,
        avatarColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// For Vercel serverless deployment
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}