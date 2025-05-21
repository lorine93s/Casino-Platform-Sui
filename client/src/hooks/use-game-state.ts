import { useState, useCallback } from "react";
import { GameType } from "@shared/schema";
import { playGame, startGameSession, GameResult } from "@/lib/game-utils";
import { useWallet } from "@/contexts/wallet-context";
import { useToast } from "@/hooks/use-toast";

interface GameState {
  isPlaying: boolean;
  betAmount: number;
  lastResult: GameResult | null;
  clientSeed: string;
  serverSeedHash: string;
  nonce: number;
}

type ResultProcessor = (result: any, ...args: any[]) => { isWin: boolean; multiplier: number };

export function useGameState(gameType: GameType) {
  const { user } = useWallet();
  const { toast } = useToast();
  
  const [state, setState] = useState<GameState>({
    isPlaying: false,
    betAmount: 1,
    lastResult: null,
    clientSeed: "",
    serverSeedHash: "",
    nonce: 0,
  });
  
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Initialize the game session
  const initGame = useCallback(async () => {
    if (isInitializing) return;
    
    try {
      setIsInitializing(true);
      const { clientSeed, serverSeed, serverSeedHash, nonce } = await startGameSession(gameType);
      
      setState(prev => ({
        ...prev,
        clientSeed,
        serverSeedHash,
        nonce,
        // Store the server seed in a different variable that's not exposed to the state
        serverSeed: serverSeed,
      }));
    } catch (error) {
      console.error("Error initializing game:", error);
      toast({
        title: "Game Initialization Failed",
        description: "Could not start the game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  }, [gameType, isInitializing, toast]);
  
  // Play the game
  const play = useCallback(async (
    resultProcessor: ResultProcessor,
    ...processorArgs: any[]
  ) => {
    if (!user) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to play.",
        variant: "destructive",
      });
      return null;
    }
    
    if (state.betAmount <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount.",
        variant: "destructive",
      });
      return null;
    }
    
    if (user.balance < state.betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SUI to place this bet.",
        variant: "destructive",
      });
      return null;
    }
    
    // If we don't have game data initialized, do it now
    if (!state.clientSeed || !state.serverSeedHash) {
      await initGame();
    }
    
    setState(prev => ({ ...prev, isPlaying: true }));
    
    try {
      // Get the stored serverSeed that was not exposed in the state
      const serverSeed = (state as any).serverSeed;
      
      // Play the game
      const result = await playGame(
        user.id,
        gameType,
        state.betAmount,
        state.clientSeed,
        serverSeed,
        state.serverSeedHash,
        state.nonce,
        (gameResult) => resultProcessor(gameResult, ...processorArgs)
      );
      
      // Update state with the result
      setState(prev => ({ 
        ...prev, 
        isPlaying: false,
        lastResult: result,
      }));
      
      // Initialize for the next game
      initGame();
      
      // Show a toast with the result
      toast({
        title: result.win ? "You Won!" : "You Lost",
        description: result.win 
          ? `You won ${result.winnings.toFixed(2)} SUI!` 
          : `Better luck next time.`,
        variant: result.win ? "default" : "destructive",
      });
      
      return result;
    } catch (error) {
      console.error("Error playing game:", error);
      setState(prev => ({ ...prev, isPlaying: false }));
      
      toast({
        title: "Game Error",
        description: "An error occurred while playing. Please try again.",
        variant: "destructive",
      });
      
      return null;
    }
  }, [gameType, state, user, toast, initGame]);
  
  // Set the bet amount
  const setBetAmount = useCallback((amount: number) => {
    setState(prev => ({ ...prev, betAmount: amount }));
  }, []);
  
  // Initialize the game state when the component mounts
  useCallback(() => {
    initGame();
  }, [initGame]);
  
  return {
    state,
    isInitializing,
    play,
    setBetAmount,
    initGame,
  };
}
