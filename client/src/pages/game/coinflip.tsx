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
import { processCoinFlipResult } from "@/lib/game-utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CoinFlipGame() {
  const { toast } = useToast();
  const { wallet, isConnected, connect } = useWallet();
  const [isFlipping, setIsFlipping] = useState(false);
  const [prediction, setPrediction] = useState<"heads" | "tails">("heads");
  const [coinRotation, setCoinRotation] = useState(0);
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null);
  
  const {
    state,
    play,
    setBetAmount,
    initGame
  } = useGameState("coinflip");

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

  const handleFlip = async () => {
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

    setIsFlipping(true);
    setFlipResult(null);
    
    // Animate coin flipping
    let flips = 0;
    const maxFlips = 10 + Math.floor(Math.random() * 5);
    
    const flipAnimation = setInterval(() => {
      setCoinRotation(prev => prev + 180);
      flips++;
      
      if (flips >= maxFlips) {
        clearInterval(flipAnimation);
      }
    }, 150);
    
    try {
      const result = await play(
        processCoinFlipResult,
        { side: "heads" }, // This will be replaced by the actual result
        prediction
      );
      
      setTimeout(() => {
        clearInterval(flipAnimation);
        setIsFlipping(false);
        
        if (result) {
          setFlipResult(result.result.side);
        }
      }, 2000);
    } catch (error) {
      clearInterval(flipAnimation);
      setIsFlipping(false);
      console.error(error);
    }
  };

  const renderCoin = () => {
    return (
      <motion.div
        className="w-40 h-40 relative"
        animate={{ rotateY: coinRotation }}
        transition={{ duration: 0.15 }}
      >
        <div className="absolute inset-0 rounded-full bg-[#f7d35e] border-4 border-[#e6b73c] flex items-center justify-center shadow-lg backface-hidden">
          <div className="text-4xl">H</div>
        </div>
        <div 
          className="absolute inset-0 rounded-full bg-[#c0c0c0] border-4 border-[#a0a0a0] flex items-center justify-center shadow-lg"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          <div className="text-4xl">T</div>
        </div>
      </motion.div>
    );
  };

  return (
    <MainLayout title="Coin Flip Game">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-850 border-slate-700 h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Coins className="mr-2 h-6 w-6" />
                    Coin Flip
                  </CardTitle>
                  <Badge className="bg-accent/20 text-accent">
                    Provably Fair
                  </Badge>
                </div>
                <CardDescription>
                  Predict if the coin will land on heads or tails
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6">
                {/* Coin display */}
                <div className="w-full max-w-md bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex justify-center mb-8">
                      {renderCoin()}
                    </div>
                    
                    <AnimatePresence>
                      {flipResult && !isFlipping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-center mb-6"
                        >
                          <div className="text-2xl font-display font-bold mb-2">
                            {flipResult.toUpperCase()}!
                          </div>
                          {state.lastResult && (
                            <Badge className={state.lastResult.win ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}>
                              {state.lastResult.win ? 'You Won!' : 'You Lost'}
                            </Badge>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Prediction selection */}
                    <div className="w-full grid grid-cols-2 gap-4 mb-6">
                      <Button
                        variant={prediction === "heads" ? "default" : "outline"}
                        className={prediction === "heads" ? "bg-primary hover:bg-primary/90" : "bg-slate-900 border-slate-700"}
                        onClick={() => setPrediction("heads")}
                        disabled={isFlipping}
                      >
                        Heads
                      </Button>
                      <Button
                        variant={prediction === "tails" ? "default" : "outline"}
                        className={prediction === "tails" ? "bg-secondary hover:bg-secondary/90" : "bg-slate-900 border-slate-700"}
                        onClick={() => setPrediction("tails")}
                        disabled={isFlipping}
                      >
                        Tails
                      </Button>
                    </div>
                    
                    {/* Bet controls */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-sm text-slate-400">Bet Amount (SUI)</label>
                        <Input
                          type="number"
                          value={state.betAmount || ""}
                          onChange={(e) => handleBetInput(e.target.value)}
                          className="bg-slate-900 border-slate-700"
                          disabled={isFlipping}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-slate-400">Potential Win</label>
                        <div className="bg-slate-900 border border-slate-700 rounded-md h-10 flex items-center px-3 font-medium">
                          {((state.betAmount || 0) * 1.98).toFixed(2)} SUI
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick bet buttons */}
                    <div className="w-full flex space-x-2 mb-6">
                      <Button variant="outline" className="flex-1 bg-slate-900 border-slate-700" onClick={() => setBetAmount(0.1)} disabled={isFlipping}>
                        0.1 SUI
                      </Button>
                      <Button variant="outline" className="flex-1 bg-slate-900 border-slate-700" onClick={() => setBetAmount(0.5)} disabled={isFlipping}>
                        0.5 SUI
                      </Button>
                      <Button variant="outline" className="flex-1 bg-slate-900 border-slate-700" onClick={() => setBetAmount(1)} disabled={isFlipping}>
                        1 SUI
                      </Button>
                      <Button variant="outline" className="flex-1 bg-slate-900 border-slate-700" onClick={() => setBetAmount(5)} disabled={isFlipping}>
                        5 SUI
                      </Button>
                    </div>
                    
                    {/* Flip button */}
                    <Button
                      onClick={handleFlip}
                      disabled={isFlipping || !isConnected || state.betAmount <= 0}
                      className="bg-accent hover:bg-accent/90 text-white font-semibold py-6 text-lg w-full"
                    >
                      {isFlipping ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Flipping...
                        </>
                      ) : (
                        <>
                          <Coins className="mr-2 h-5 w-5" />
                          {isConnected ? `Flip Coin (${prediction})` : "Connect Wallet to Play"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Recent flips */}
                <div className="w-full max-w-md">
                  <h3 className="text-xl font-display font-bold mb-4">Last 10 Flips</h3>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="grid grid-cols-10 gap-1 p-2">
                      {[...Array(10)].map((_, index) => {
                        // Here we would typically use actual flip history
                        // For this demo, we'll generate random results
                        const isHeads = Math.random() > 0.5;
                        return (
                          <div 
                            key={index} 
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              isHeads 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-secondary/20 text-secondary'
                            }`}
                          >
                            {isHeads ? 'H' : 'T'}
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
                    <span className="text-slate-400">Win Chance</span>
                    <span className="font-medium">50%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Multiplier</span>
                    <span className="font-medium">1.98x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">House Edge</span>
                    <span className="font-medium">2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Bet</span>
                    <span className="font-medium">0.1 SUI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Bet</span>
                    <span className="font-medium">100 SUI</span>
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
                    <li>Choose which side you think the coin will land on: Heads or Tails</li>
                    <li>Enter your bet amount</li>
                    <li>Click "Flip Coin" to start the game</li>
                    <li>If the coin lands on your predicted side, you win 1.98x your bet</li>
                    <li>If the coin lands on the opposite side, you lose your bet</li>
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
