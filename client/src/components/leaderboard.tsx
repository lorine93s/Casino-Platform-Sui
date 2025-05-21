import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { User, Dice5, Coins, SlidersVertical, TrendingUp } from "lucide-react";

export function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
    staleTime: 60000, // Refetch after 1 minute
  });

  // Game type icons
  const gameIcons = {
    dice: <Dice5 className="text-slate-400 mr-2 h-4 w-4" />,
    coinflip: <Coins className="text-slate-400 mr-2 h-4 w-4" />,
    slots: <SlidersVertical className="text-slate-400 mr-2 h-4 w-4" />,
    crash: <TrendingUp className="text-slate-400 mr-2 h-4 w-4" />
  };

  // Avatar colors
  const avatarColors = {
    primary: "bg-primary/20",
    secondary: "bg-secondary/20",
    accent: "bg-accent/20",
    warning: "bg-warning/20",
    danger: "bg-destructive/20"
  };

  // Avatar text colors
  const avatarTextColors = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    warning: "text-warning",
    danger: "text-destructive"
  };

  return (
    <div className="glassmorphism rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 header-gradient flex justify-between items-center">
        <h3 className="font-display font-bold text-xl">Top Players</h3>
        <select className="bg-slate-700 text-white border-none rounded-lg p-2 text-sm">
          <option>Last 24 Hours</option>
          <option>Last Week</option>
          <option>All Time</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-slate-300 text-sm">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Player</th>
              <th className="p-4">Games</th>
              <th className="p-4">Net Profit</th>
              <th className="p-4">Favorite Game</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </td>
                  <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              (leaderboard || []).slice(0, 5).map((entry, index) => (
                <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full ${avatarColors[entry.user?.avatarColor || 'primary']} flex items-center justify-center mr-2`}>
                        <User className={`${avatarTextColors[entry.user?.avatarColor || 'primary']} text-sm h-4 w-4`} />
                      </div>
                      <span>{formatAddress(entry.user?.walletAddress || "")}</span>
                    </div>
                  </td>
                  <td className="p-4">{entry.gamesPlayed}</td>
                  <td className="p-4 text-accent font-medium">+{formatCurrency(entry.netProfit)}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {entry.favoriteGame ? (
                        <>
                          {gameIcons[entry.favoriteGame as keyof typeof gameIcons]}
                          <span>{entry.favoriteGame.charAt(0).toUpperCase() + entry.favoriteGame.slice(1)}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">None yet</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
