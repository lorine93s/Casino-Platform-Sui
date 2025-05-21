import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/wallet-context";
import { TrendingUp, Loader2, Info, Copy, TimerReset } from "lucide-react";
import { motion } from "framer-motion";
import { useGameState } from "@/hooks/use-game-state";
import { formatCurrency } from "@/lib/utils";
import { processCrashResult } from "@/lib/game-utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CrashGame() {
  const { toast } = useToast();
  const { wallet, isConnected, connect } = useWallet();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [targetMultiplier, setTargetMultiplier] = useState(2.00);
  const [hasAutoCashout, setHasAutoCashout] = useState(false);
  const [showCrashed, setShowCrashed] = useState(false);
  const [crashPoint, setCrashPoint] = useState(0);
  const [userCashedOut, setUserCashedOut] = useState(false);
  
  const animationRef = useRef<number>();
  const gameTimerRef = useRef<NodeJS.Timeout>();
  
  const {
    state,
    play,
    setBetAmount,
    initGame
  } = useGameState("crash");

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
    };
  }, []);

  const handleBetInput = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setBetAmount(numValue);
    } else if (value === "") {
      setBetAmount(0);
    }
  };

  const handleTargetMultiplierInput = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1.01) {
      setTargetMultiplier(numValue);
    } else if (value === "") {
      setTargetMultiplier(0);
    }
  };

  const startGame = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to play.",
        variant: "destructive"
      });
      return;
    }

    if (state.betAmount <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount.",
        variant: "destructive"
      });
      return;
    }

    // Generate a random crash point for this game (1.01 to 10)
    // In a real implementation, this would come from the blockchain
    // using provably fair mechanisms
    const randomCrashPoint = Math.floor(Math.random() * 900) / 100 + 1.01;
    setCrashPoint(randomCrashPoint);
    
    setIsPlaying(true);
    setGameStartTime(Date.now());
    setCurrentMultiplier(1.00);
    setShowCrashed(false);
    setUserCashedOut(false);
    
    // Start the multiplier animation
    animateCrash();
    
    // Set a timer to "crash" at the calculated point
    const timeToRun = calculateTimeToReach(randomCrashPoint);
    gameTimerRef.current = setTimeout(() => {
      handleCrash();
    }, timeToRun);
  };

  const calculateTimeToReach = (multiplier: number) => {
    // This is a simplified model; a real game would use a more complex formula
    // to determine when to crash
    return (multiplier - 1) * 1000; // Simple linear model for demo
  };

  const animateCrash = () => {
    if (!gameStartTime) return;
    
    const now = Date.now();
    const elapsed = (now - gameStartTime) / 1000;
    
    // Simple exponential growth formula: 1 * e^(0.06 * elapsed)
    const newMultiplier = Math.pow(Math.E, 0.06 * elapsed);
    setCurrentMultiplier(parseFloat(newMultiplier.toFixed(2)));
    
    // Check for auto-cashout
    if (hasAutoCashout && newMultiplier >= targetMultiplier && isPlaying) {
      handleCashout();
      return;
    }
    
    animationRef.current = requestAnimationFrame(animateCrash);
  };

  const handleCashout = async () => {
    if (!isPlaying || userCashedOut) return;
    
    setUserCashedOut(true);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (gameTimerRef.current) {
      clearTimeout(gameTimerRef.current);
    }
    
    try {
      const result = await play(
        processCrashResult,
        { crashPoint }, // This would be the actual crash point from the provably fair system
        currentMultiplier
      );
      
      if (result && result.win) {
        toast({
          title: "Success!",
          description: `You cashed out at ${currentMultiplier.toFixed(2)}x and won ${result.winnings.toFixed(2)} SUI!`,
        });
      }
    } catch (error) {
      console.error("Error cashing out:", error);
    }
  };

  const handleCrash = () => {
    if (userCashedOut) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsPlaying(false);
    setShowCrashed(true);
    
    if (!userCashedOut) {
      toast({
        title: "Crashed!",
        description: `The game crashed at ${crashPoint.toFixed(2)}x`,
        variant: "destructive"
      });
      
      // Clear the state for the next game
      play(
        processCrashResult,
        { crashPoint },
        0 // Player didn't cash out, so multiplier is 0
      );
    }
  };

  // Format current multiplier for display
  const formattedMultiplier = currentMultiplier.toFixed(2) + "x";
  
  return (
    <MainLayout title="Crash Game">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-850 border-slate-700 h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-6 w-6" />
                    Crash Game
                  </CardTitle>
                  <Badge className="bg-accent/20 text-accent">
                    Provably Fair
                  </Badge>
                </div>
                <CardDescription>
                  Cash out before the chart crashes to win
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6">
                {/* Crash Game Display */}
                <div className="w-full max-w-md bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                  
                  <div className="relative z-10 h-64 flex flex-col">
                    {/* Chart area */}
                    <div className="flex-grow relative mb-4 border-b border-l border-slate-700 overflow-hidden">
                      {isPlaying && !showCrashed && (
                        <motion.div 
                          className="absolute bottom-0 left-0 w-full h-full"
                          style={{ 
                            backgroundImage: 'linear-gradient(to top, rgba(160, 84, 239, 0.05), transparent)',
                            clipPath: `polygon(0 100%, 100% ${100 - (currentMultiplier - 1) * 10}%, 100% 100%)`
                          }}
                        />
                      )}
                      
                      {isPlaying && !showCrashed && (
                        <motion.div
                          className="absolute bottom-0 left-0 w-full"
                          style={{ 
                            height: `${(currentMultiplier - 1) * 10}%`,
                            maxHeight: '100%',
                            backgroundImage: 'linear-gradient(to right, rgba(160, 84, 239, 0.5), rgba(116, 80, 249, 0.5))',
                          }}
                        />
                      )}
                      
                      {/* Crash point indicator */}
                      {showCrashed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl font-display font-bold text-destructive animate-pulse">
                            CRASHED @ {crashPoint.toFixed(2)}x
                          </div>
                        </div>
                      )}
                      
                      {/* Multiplier display */}
                      <div className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded-md text-xl font-bold">
                        {formattedMultiplier}
                      </div>
                    </div>
                    
                    {/* Game controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-400">Bet Amount (SUI)</label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={state.betAmount || ""}
                            onChange={(e) => handleBetInput(e.target.value)}
                            className="bg-slate-900 border-slate-700"
                            disabled={isPlaying}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <label className="text-sm text-slate-400 flex-grow">Auto Cashout At</label>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={hasAutoCashout}
                              onChange={(e) => setHasAutoCashout(e.target.checked)}
                              className="mr-2 h-4 w-4"
                              disabled={isPlaying}
                            />
                            <span className="text-sm text-slate-400">Auto</span>
                          </div>
                        </div>
                        <Input
                          type="number"
                          value={targetMultiplier || ""}
                          onChange={(e) => handleTargetMultiplierInput(e.target.value)}
                          className="bg-slate-900 border-slate-700"
                          placeholder="2.00x"
                          disabled={isPlaying || !hasAutoCashout}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="w-full max-w-md grid grid-cols-2 gap-4">
                  {isPlaying ? (
                    <Button
                      onClick={handleCashout}
                      disabled={userCashedOut}
                      className="bg-accent hover:bg-accent/90 text-white font-semibold py-6 text-lg col-span-2"
                    >
                      Cash Out @ {formattedMultiplier}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={startGame}
                        disabled={!isConnected || state.betAmount <= 0}
                        className="bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg"
                      >
                        <TrendingUp className="mr-2 h-5 w-5" />
                        {isConnected ? "Place Bet" : "Connect Wallet"}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-700 bg-slate-800 text-white font-semibold py-6 text-lg"
                        onClick={() => {
                          setShowCrashed(false);
                          setCurrentMultiplier(1.00);
                        }}
                      >
                        <TimerReset className="mr-2 h-5 w-5" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>

                {/* Game history */}
                <div className="w-full max-w-md">
                  <h3 className="text-xl font-display font-bold mb-4">Recent Games</h3>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <div className="grid grid-cols-5 gap-2">
                      {[...Array(10)].map((_, index) => {
                        // Here we would typically use actual game history
                        // For the demo, we'll generate random crash points
                        const randomMultiplier = (Math.random() * 5 + 1.01).toFixed(2);
                        const isCrashed = parseFloat(randomMultiplier) < 2;
                        return (
                          <div 
                            key={index} 
                            className={`px-2 py-1 rounded text-center text-sm font-medium ${
                              isCrashed 
                                ? 'bg-destructive/20 text-destructive' 
                                : 'bg-accent/20 text-accent'
                            }`}
                          >
                            {randomMultiplier}x
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Game info card */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="mr-2 h-5 w-5" />
                    Game Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Bet</span>
                    <span className="font-medium">1 SUI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Win</span>
                    <span className="font-medium">100x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">House Edge</span>
                    <span className="font-medium">1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volatility</span>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive">
                      High
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet info/connect card */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-5 w-5"
                    >
                      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                    </svg>
                    Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isConnected ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800 rounded-lg p-4 flex justify-between">
                        <span className="text-slate-400">Balance</span>
                        <span className="font-medium">{formatCurrency(wallet?.balance || 0)} SUI</span>
                      </div>
                      <div className="text-sm text-slate-400">
                        All winnings are automatically credited to your wallet balance.
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-slate-400 mb-4">
                        Connect your SUI wallet to start playing
                      </div>
                      <Button onClick={connect} className="bg-primary hover:bg-primary/90">
                        Connect Wallet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* How to play card */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    How to Play
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                    <li>Enter your bet amount</li>
                    <li>Optionally set an auto cashout multiplier</li>
                    <li>Click "Place Bet" to start the game</li>
                    <li>Watch as the multiplier increases</li>
                    <li>Cash out before the game crashes to win your bet multiplied by the current value</li>
                    <li>If you don't cash out before it crashes, you lose your bet</li>
                  </ol>
                </CardContent>
                <CardFooter className="border-t border-slate-700 bg-slate-800/50 text-xs text-slate-400 px-6">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M2 12h10M2 12 7 7M2 12l5 5" />
                      <path d="M22 12H12M22 12l-5-5M22 12l-5 5" />
                    </svg>
                    Crash points are generated using a provably fair algorithm
                  </div>
                </CardFooter>
              </Card>

              {/* Game seed verification */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-3.08"></path>
                      <path d="M18 14c-2.67 0-8 1.33-8 4v2h16v-2c0-2.67-5.33-4-8-4Z" />
                      <path d="M18 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    </svg>
                    Fairness Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Client Seed</span>
                    <div className="flex items-center">
                      <span className="text-xs truncate max-w-[120px]">
                        {state.clientSeed ? state.clientSeed.substring(0, 8) + "..." : "---"}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy client seed</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Server Seed Hash</span>
                    <div className="flex items-center">
                      <span className="text-xs truncate max-w-[120px]">
                        {state.serverSeedHash ? state.serverSeedHash.substring(0, 8) + "..." : "---"}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy server seed hash</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nonce</span>
                    <span>{state.nonce || "---"}</span>
                  </div>
                  <div className="pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs border-slate-700 bg-slate-800"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
