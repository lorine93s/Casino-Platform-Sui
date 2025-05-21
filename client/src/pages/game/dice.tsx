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
import { CasinoStats } from "@/components/casino-stats";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/wallet-context";
import { Dice5, ArrowUp, ArrowDown, Loader2, Info, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/hooks/use-game-state";
import { formatCurrency } from "@/lib/utils";
import { processDiceResult } from "@/lib/game-utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DiceGame() {
  const { toast } = useToast();
  const { wallet, isConnected, connect } = useWallet();
  const [targetValue, setTargetValue] = useState(50);
  const [betMode, setBetMode] = useState<"over" | "under">("over");
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  
  const {
    state,
    play,
    setBetAmount,
    initGame
  } = useGameState("dice");

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Calculate win probability and payout multiplier
  const calculateWinProbability = () => {
    if (betMode === "over") {
      return 100 - targetValue;
    } else {
      return targetValue;
    }
  };

  const calculateMultiplier = () => {
    const probability = calculateWinProbability();
    // Adjust for house edge
    return parseFloat((99 / probability).toFixed(2));
  };

  const handleValueChange = (values: number[]) => {
    setTargetValue(values[0]);
  };

  const handleBetInput = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setBetAmount(numValue);
    } else if (value === "") {
      setBetAmount(0);
    }
  };

  const handleRoll = async () => {
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

    setIsRolling(true);
    
    // Animate the dice roll
    const rollAnimation = setInterval(() => {
      setRollResult(Math.floor(Math.random() * 101));
    }, 50);
    
    try {
      const result = await play(
        processDiceResult,
        { roll: 0 }, // This will be replaced by the actual result
        targetValue,
        betMode
      );
      
      setTimeout(() => {
        clearInterval(rollAnimation);
        setIsRolling(false);
        
        if (result) {
          setRollResult(result.result.roll);
        }
      }, 1500);
    } catch (error) {
      clearInterval(rollAnimation);
      setIsRolling(false);
      console.error(error);
    }
  };

  return (
    <MainLayout title="Dice5 Game">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-850 border-slate-700 h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Dice5 className="mr-2 h-6 w-6" />
                    Dice5 Roll
                  </CardTitle>
                  <Badge className="bg-accent/20 text-accent">
                    Provably Fair
                  </Badge>
                </div>
                <CardDescription>
                  Predict if the dice roll will be over or under your chosen number
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6">
                {/* Dice5 roll display */}
                <div className="w-48 h-48 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                  <AnimatePresence mode="wait">
                    {isRolling ? (
                      <motion.div
                        key="rolling"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center"
                      >
                        <Dice5 className="animate-spin h-12 w-12 text-slate-300 mb-2" />
                        <div className="text-xl font-bold font-display">Rolling...</div>
                      </motion.div>
                    ) : rollResult !== null ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center"
                      >
                        <div className="text-6xl font-bold font-display">
                          {rollResult}
                        </div>
                        {state.lastResult && (
                          <Badge className={`mt-2 ${state.lastResult.win ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}`}>
                            {state.lastResult.win ? 'Win' : 'Loss'}
                          </Badge>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center"
                      >
                        <Dice5 className="h-16 w-16 text-slate-400 mb-2" />
                        <div className="text-slate-400 text-center">
                          Roll the dice and<br />test your luck
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Target value slider */}
                <div className="w-full max-w-md">
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={() => setBetMode("under")}
                      className={`flex items-center px-3 py-1 rounded ${betMode === "under" ? 'bg-primary/20 text-primary' : 'text-slate-400'}`}
                    >
                      <ArrowDown className="h-4 w-4 mr-1" />
                      Under
                    </button>
                    <div className="text-xl font-display font-bold">
                      {targetValue}
                    </div>
                    <button
                      onClick={() => setBetMode("over")}
                      className={`flex items-center px-3 py-1 rounded ${betMode === "over" ? 'bg-primary/20 text-primary' : 'text-slate-400'}`}
                    >
                      Over
                      <ArrowUp className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  <div className="relative pt-1">
                    <div className="w-full h-2 bg-slate-700 rounded-full">
                      <div 
                        className={`h-full rounded-full ${betMode === "under" ? 'bg-primary' : 'bg-slate-700'}`}
                        style={{ width: `${targetValue}%` }}
                      ></div>
                    </div>
                    <Slider
                      defaultValue={[50]}
                      value={[targetValue]}
                      onValueChange={handleValueChange}
                      min={1}
                      max={98}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Bet controls */}
                <div className="w-full max-w-md grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-slate-400">Bet Amount (SUI)</label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        value={state.betAmount || ""}
                        onChange={(e) => handleBetInput(e.target.value)}
                        className="bg-slate-800 border-slate-700"
                      />
                      <div className="flex space-x-1">
                        <Button variant="outline" className="px-2 py-0 h-10 bg-slate-800 border-slate-700" onClick={() => setBetAmount(state.betAmount / 2)}>
                          ½
                        </Button>
                        <Button variant="outline" className="px-2 py-0 h-10 bg-slate-800 border-slate-700" onClick={() => setBetAmount(state.betAmount * 2)}>
                          2×
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-slate-400">Potential Win</label>
                    <div className="bg-slate-800 border border-slate-700 rounded-md h-10 flex items-center px-3 font-medium">
                      {(state.betAmount * calculateMultiplier()).toFixed(2)} SUI
                    </div>
                  </div>
                </div>

                {/* Roll button */}
                <Button
                  onClick={handleRoll}
                  disabled={isRolling || !isConnected || state.betAmount <= 0}
                  className="bg-accent hover:bg-accent/90 text-white font-semibold py-6 px-8 text-lg w-full max-w-md"
                >
                  {isRolling ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Dice5 className="mr-2 h-5 w-5" />
                  )}
                  {isConnected ? (
                    isRolling ? "Rolling..." : `Roll ${betMode === "over" ? "Over" : "Under"} ${targetValue}`
                  ) : (
                    "Connect Wallet to Play"
                  )}
                </Button>
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
                    <span className="font-medium">{calculateWinProbability()}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Multiplier</span>
                    <span className="font-medium">{calculateMultiplier()}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Roll Type</span>
                    <Badge variant="outline" className={`${betMode === "over" ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                      {betMode === "over" ? "OVER" : "UNDER"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Value</span>
                    <span className="font-medium">{targetValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Range</span>
                    <span className="font-medium">
                      {betMode === "over" ? `${targetValue+1}-100` : `0-${targetValue-1}`}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Casino Stats Card */}
              <CasinoStats />

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
                    <li>Choose a target number between 1 and 98</li>
                    <li>Select whether you want to bet on the roll being "Over" or "Under" your target</li>
                    <li>Enter your bet amount</li>
                    <li>Click "Roll" and wait for the result</li>
                    <li>If your prediction is correct, you win!</li>
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
