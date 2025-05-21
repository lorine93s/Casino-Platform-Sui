import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GameCard } from "@/components/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dice5, Coins, Dice3, TrendingUp } from "lucide-react";

export function GamesSection() {
  const { data: gameTypes, isLoading } = useQuery({
    queryKey: ['/api/games/types'],
  });

  // Game icons
  const gameIcons = {
    slots: <Dice3 className="h-12 w-12" />,
    dice: <Dice5 className="h-12 w-12" />,
    coinflip: <Coins className="h-12 w-12" />,
    crash: <TrendingUp className="h-12 w-12" />
  };

  // Game details
  const gameDetails = {
    slots: {
      title: "Crypto Slots",
      description: "Spin to win big rewards",
      minBet: 0.1,
      maxWin: "1000x",
      tags: [
        { text: "Popular", variant: "primary" },
        { text: "High RTP", variant: "accent" }
      ]
    },
    dice: {
      title: "Dice5 Roll",
      description: "Predict the outcome",
      minBet: 0.5,
      maxWin: "10x",
      tags: [
        { text: "Hot", variant: "warning" },
        { text: "95% RTP", variant: "accent" }
      ]
    },
    coinflip: {
      title: "Coin Flip",
      description: "Heads or tails?",
      minBet: 0.1,
      maxWin: "1.98x",
      tags: [
        { text: "Beginner", variant: "secondary" },
        { text: "98% RTP", variant: "accent" }
      ]
    },
    crash: {
      title: "Crash Game",
      description: "Cash out before crash",
      minBet: 1,
      maxWin: "100x",
      tags: [
        { text: "Risky", variant: "destructive" },
        { text: "New", variant: "primary" }
      ]
    }
  };

  return (
    <section className="py-12 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display font-bold text-2xl lg:text-3xl">Featured Games</h2>
          <a href="#" className="text-accent hover:underline flex items-center">
            View all games
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="ml-2 h-4 w-4"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Skeletons for loading state
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-700 overflow-hidden">
                <div className="aspect-[4/3] bg-slate-800">
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    <Skeleton className="h-12 w-12 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="p-4 bg-slate-800">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Game cards
            (gameTypes || ["slots", "dice", "coinflip", "crash"]).map((gameType) => {
              const details = gameDetails[gameType as keyof typeof gameDetails];
              
              return (
                <GameCard
                  key={gameType}
                  gameType={gameType}
                  title={details.title}
                  description={details.description}
                  minBet={details.minBet}
                  maxWin={details.maxWin}
                  tags={details.tags}
                  icon={gameIcons[gameType as keyof typeof gameIcons]}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
