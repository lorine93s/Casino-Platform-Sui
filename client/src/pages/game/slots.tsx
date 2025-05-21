import { useState, useEffect } from "react";
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
import { Coins, Loader2, Info, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/hooks/use-game-state";
import { formatCurrency } from "@/lib/utils";
import { processSlotsResult } from "@/lib/game-utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Coins images (using emoji as placeholder, in a real app would use SVGs)
const SLOT_SYMBOLS = [
  "🍒", "🍋", "🍊", "🍇", "🍉", "💎", "7️⃣", "🔔", "🍀", "⭐"
];

export default function SlotsGame() {
  const { toast } = useToast();
  const { wallet, isConnected, connect } = useWallet();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<number[]>([0, 0, 0]);
  const [spinCount, setSpinCount] = useState(0);
  
  const {
    state,
    play,
    setBetAmount,
    initGame
  } = useGameState("slots");

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleBetInput = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setBetAmount(numValue);
    } else if (value === "") {
      setBetAmount(0);
    }
  };

  const handleSpin = async () => {
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

    setIsSpinning(true);
    
    // Animate the slots spinning
    const reelAnimation = setInterval(() => {
      setReels([
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
      ]);
      setSpinCount(prev => prev + 1);
    }, 100);
    
    try {
      const result = await play(
        processSlotsResult,
        { reels: [0, 0, 0] } // This will be replaced by the actual result
      );
      
      setTimeout(() => {
        clearInterval(reelAnimation);
        setIsSpinning(false);
        
        if (result) {
          setReels(result.result.reels);
        }
      }, 2000);
    } catch (error) {
      clearInterval(reelAnimation);
      setIsSpinning(false);
      console.error(error);
    }
  };

  const getWinDescription = () => {
    if (!state.lastResult || !state.lastResult.win) return "";
    
    const lastReels = state.lastResult.result.reels;
    if (lastReels[0] === lastReels[1] && lastReels[1] === lastReels[2]) {
      return "JACKPOT! All three matching!";
    } else if (
      lastReels[0] === lastReels[1] || 
      lastReels[1] === lastReels[2] || 
      lastReels[0] === lastReels[2]
    ) {
      return "Two matching symbols!";
    }
    return "";
  };

  return (
    <MainLayout title="Slots Game">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-850 border-slate-700 h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Coins className="mr-2 h-6 w-6" />
                    Crypto Slots
                  </CardTitle>
                  <Badge className="bg-accent/20 text-accent">
                    Provably Fair
                  </Badge>
                </div>
                <CardDescription>
                  Spin the reels and match symbols to win big rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6">
                {/* Slots display */}
                <div className="w-full max-w-md bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                  
                  {/* Coins machine */}
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <h3 className="text-2xl font-display font-bold text-slate-200">Crypto Slots</h3>
                    </div>
                    
                    <div className="flex justify-center mb-6">
                      <div className="flex space-x-4">
                        {reels.map((reel, index) => (
                          <motion.div
                            key={index}
                            className="w-20 h-24 bg-slate-900 border-2 border-slate-700 rounded-lg flex items-center justify-center shadow-inner"
                            animate={{ y: isSpinning ? [0, -10, 0, 10, 0] : 0 }}
                            transition={{ 
                              repeat: isSpinning ? Infinity : 0, 
                              duration: 0.3,
                              delay: index * 0.1
                            }}
                          >
                            <span className="text-4xl">{SLOT_SYMBOLS[reel]}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {state.lastResult && state.lastResult.win && !isSpinning && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-center mb-4"
                        >
                          <div className="text-accent font-display font-bold text-xl">
                            {getWinDescription()}
                          </div>
                          <div className="text-accent">
                            You won {state.lastResult.winnings.toFixed(2)} SUI!
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Bet controls */}
                    <div className="flex flex-col space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm text-slate-400">Bet Amount (SUI)</label>
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              value={state.betAmount || ""}
                              onChange={(e) => handleBetInput(e.target.value)}
                              className="bg-slate-900 border-slate-700"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm text-slate-400">Quick Bet</label>
                          <div className="grid grid-cols-3 gap-1">
                            <Button variant="outline" className="bg-slate-900 border-slate-700" onClick={() => setBetAmount(0.1)}>
                              0.1
                            </Button>
                            <Button variant="outline" className="bg-slate-900 border-slate-700" onClick={() => setBetAmount(1)}>
                              1.0
                            </Button>
                            <Button variant="outline" className="bg-slate-900 border-slate-700" onClick={() => setBetAmount(5)}>
                              5.0
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Spin button */}
                      <Button
                        onClick={handleSpin}
                        disabled={isSpinning || !isConnected || state.betAmount <= 0}
                        className="bg-accent hover:bg-accent/90 text-white font-semibold py-6 text-lg w-full"
                      >
                        {isSpinning ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Spinning...
                          </>
                        ) : (
                          <>
                            <Coins className="mr-2 h-5 w-5" />
                            {isConnected ? "Spin the Reels" : "Connect Wallet to Play"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Paytable */}
                <div className="w-full max-w-md bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-xl font-display font-bold mb-4">Paytable</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">💎💎💎</span>
                          <span>Diamonds</span>
                        </div>
                        <span className="font-medium">20x</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">7️⃣7️⃣7️⃣</span>
                          <span>Lucky Sevens</span>
                        </div>
                        <span className="font-medium">15x</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">🍀🍀🍀</span>
                          <span>Clovers</span>
                        </div>
                        <span className="font-medium">12x</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">⭐⭐⭐</span>
                          <span>Stars</span>
                        </div>
                        <span className="font-medium">10x</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">🍒🍒🍒</span>
                          <span>Cherries</span>
                        </div>
                        <span className="font-medium">8x</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">Any 3</span>
                          <span>Same Symbol</span>
                        </div>
                        <span className="font-medium">5x</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">Any 2</span>
                        <span>Same Symbol</span>
                      </div>
                      <span className="font-medium">1.5x</span>
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
                    <span className="font-medium">0.1 SUI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Win</span>
                    <span className="font-medium">1000x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RTP</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volatility</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
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
                    <li>Click "Spin the Reels" to start</li>
                    <li>Match symbols across the three reels to win</li>
                    <li>Three matching symbols give the biggest payouts</li>
                    <li>Two matching symbols give a smaller payout</li>
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
                    Results are generated using a provably fair algorithm
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
