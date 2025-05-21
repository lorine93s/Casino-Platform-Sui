import { GameType } from "@shared/schema";
import { generateClientSeed } from "./utils";
import { apiRequest } from "./queryClient";
import { casinoWallet } from "./casino-wallet";
import suiWallet from "./sui";

// Game utility functions
export interface GameResult {
  success: boolean;
  win: boolean;
  bet: number;
  winnings: number;
  multiplier: number;
  result: any;
  clientSeed: string;
  serverSeed: string;
  serverSeedHash: string;
  nonce: number;
}

// Generate a server seed with hash from the API
export async function generateServerSeed(): Promise<{ serverSeed: string; serverSeedHash: string }> {
  const response = await apiRequest("GET", "/api/games/seed");
  const data = await response.json();
  return {
    serverSeed: data.serverSeed,
    serverSeedHash: data.serverSeedHash
  };
}

// Play a game and submit to the API
export async function playGame(
  userId: number,
  gameType: GameType,
  bet: number,
  clientSeed: string,
  serverSeed: string,
  serverSeedHash: string,
  nonce: number,
  resultProcessor: (result: any) => { isWin: boolean; multiplier: number }
): Promise<GameResult> {
  try {
    // Process the bet through SUI wallet
    await suiWallet.executeMoveCall({
      type: 'bet',
      amount: bet
    });
    
    // Verify game result on the server
    const verifyResponse = await apiRequest("POST", "/api/games/verify", {
      clientSeed,
      serverSeed,
      nonce,
      gameType
    });
    
    const verifyData = await verifyResponse.json();
    
    // Process the game result
    const { isWin, multiplier } = resultProcessor(verifyData.result);
    const winnings = isWin ? bet * multiplier : 0;
    
    // Update the casino wallet
    casinoWallet.processBet(bet, isWin, winnings);
    
    // If player won, add the winnings to their wallet
    if (isWin && winnings > 0) {
      await suiWallet.addFunds(winnings);
    }
    
    // Submit the game to the API
    const playResponse = await apiRequest("POST", "/api/games/play", {
      userId,
      type: gameType,
      bet,
      winnings,
      multiplier,
      clientSeed,
      serverSeed,
      serverSeedHash,
      nonce,
      result: verifyData.result,
      isWin
    });
    
    const playData = await playResponse.json();
    
    return {
      success: true,
      win: isWin,
      bet,
      winnings,
      multiplier,
      result: verifyData.result,
      clientSeed,
      serverSeed,
      serverSeedHash,
      nonce
    };
  } catch (error) {
    console.error("Error playing game:", error);
    throw error;
  }
}

// Dice game result processor
export function processDiceResult(
  result: { roll: number },
  target: number,
  mode: "over" | "under"
): { isWin: boolean; multiplier: number } {
  const isWin = mode === "over" 
    ? result.roll > target 
    : result.roll < target;
  
  // Calculate the multiplier based on the probability
  // For "over" mode: multiplier = 99 / (99 - target)
  // For "under" mode: multiplier = 99 / target
  const multiplier = mode === "over"
    ? parseFloat((99 / (99 - target)).toFixed(2))
    : parseFloat((99 / target).toFixed(2));
  
  return { isWin, multiplier };
}

// Coin flip result processor
export function processCoinFlipResult(
  result: { side: "heads" | "tails" },
  prediction: "heads" | "tails"
): { isWin: boolean; multiplier: number } {
  const isWin = result.side === prediction;
  // Coin flip has a fixed 2x multiplier on win
  return { isWin, multiplier: 1.98 };
}

// Slots result processor
export function processSlotsResult(
  result: { reels: number[] }
): { isWin: boolean; multiplier: number } {
  const { reels } = result;
  
  // Check for winning combinations
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    // All three matching - big win
    return { isWin: true, multiplier: 10 + reels[0] };
  } else if (
    reels[0] === reels[1] || 
    reels[1] === reels[2] || 
    reels[0] === reels[2]
  ) {
    // Two matching - small win
    return { isWin: true, multiplier: 1.5 };
  }
  
  // No matches - loss
  return { isWin: false, multiplier: 0 };
}

// Crash game result processor
export function processCrashResult(
  result: { crashPoint: number },
  cashoutMultiplier: number
): { isWin: boolean; multiplier: number } {
  const isWin = cashoutMultiplier <= result.crashPoint;
  return { isWin, multiplier: isWin ? cashoutMultiplier : 0 };
}

// Helper to start a new game session
export async function startGameSession(gameType: GameType) {
  const clientSeed = generateClientSeed();
  const { serverSeed, serverSeedHash } = await generateServerSeed();
  const nonce = Math.floor(Math.random() * 1000000);
  
  return {
    clientSeed,
    serverSeed,
    serverSeedHash,
    nonce,
    gameType
  };
}
