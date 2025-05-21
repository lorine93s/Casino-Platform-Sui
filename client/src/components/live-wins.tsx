import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress, formatCurrency, timeAgo } from "@/lib/utils";
import { Dice5, Coins, SlidersVertical, TrendingUp } from "lucide-react";

export function LiveWins() {
  const { data: recentWins, isLoading } = useQuery({
    queryKey: ['/api/games/wins'],
    staleTime: 15000, // Refetch after 15 seconds
    refetchInterval: 15000, // Poll every 15 seconds
  });

  const gameTypeIcons = {
    dice: <Dice5 className="text-primary" />,
    coinflip: <Coins className="text-secondary" />,
    slots: <SlidersVertical className="text-accent" />,
    crash: <TrendingUp className="text-warning" />
  };

  const gameTypeBgColors = {
    dice: "bg-primary/20",
    coinflip: "bg-secondary/20",
    slots: "bg-accent/20",
    crash: "bg-warning/20"
  };

  return (
    <div className="glassmorphism rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 header-gradient flex justify-between items-center">
        <h3 className="font-display font-bold text-xl">Live Wins</h3>
        <div className="flex items-center">
          <div className="h-2 w-2 bg-accent rounded-full animate-pulse mr-2"></div>
          <span className="text-sm">Live Feed</span>
        </div>
      </div>
      <div className="p-4 max-h-[400px] overflow-y-auto hide-scrollbar">
        <div className="space-y-4">
          {isLoading ? (
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="flex items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0 mr-3" />
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex justify-between mt-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            (recentWins || []).map((win, index) => (
              <div key={index} className="flex items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className={`h-10 w-10 rounded-full ${gameTypeBgColors[win.type as keyof typeof gameTypeBgColors]} flex-shrink-0 flex items-center justify-center mr-3`}>
                  {gameTypeIcons[win.type as keyof typeof gameTypeIcons]}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">{formatAddress(win.walletAddress || "")}</div>
                    <div className="text-xs text-slate-400">{timeAgo(win.timestamp)}</div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="text-xs text-slate-400">{win.type.charAt(0).toUpperCase() + win.type.slice(1)}</div>
                    <div className="text-accent font-medium">+{formatCurrency(win.winnings)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
