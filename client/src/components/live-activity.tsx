import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Dice5, UserIcon, Users, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatAddress, timeAgo } from "@/lib/utils";

export function LiveActivity() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 30000, // Refetch after 30 seconds
  });

  return (
    <div className="glassmorphism rounded-xl shadow-2xl relative overflow-hidden border border-slate-700">
      <div className="p-6 border-b border-slate-700 header-gradient">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Dice5 className="text-white text-2xl mr-2" />
            <span className="font-display font-bold text-xl">Live Activity</span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <motion.div className="animate-float">
          <div className="flex justify-between mb-4">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-40" />
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-400">Total Wagered (24h)</p>
                  <p className="font-display font-bold text-2xl">
                    {formatCurrency(stats?.totalWagered || 0)} SUI
                  </p>
                </>
              )}
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-400">Active Players</p>
                  <p className="font-display font-bold text-2xl">
                    {stats?.activePlayers || 0}
                  </p>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Recent Big Wins</span>
              <span className="text-xs text-slate-400">Last 1 hour</span>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="w-8 h-8 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(stats?.recentWins || []).slice(0, 3).map((win, index) => {
                  // Game type icons
                  const gameIcons = {
                    dice: <Dice5 className="h-4 w-4" />,
                    coinflip: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <circle cx="8" cy="8" r="7" />
                        <circle cx="16" cy="16" r="7" />
                      </svg>
                    ),
                    slots: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    ),
                    crash: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                      </svg>
                    ),
                  };

                  // Background colors
                  const bgColors = [
                    "bg-primary",
                    "bg-secondary",
                    "bg-accent"
                  ];
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${bgColors[index % 3]} flex items-center justify-center mr-3`}>
                          {gameIcons[win.type as keyof typeof gameIcons]}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{formatAddress(win.walletAddress || "")}</div>
                          <div className="text-xs text-slate-400">{win.type.charAt(0).toUpperCase() + win.type.slice(1)}</div>
                        </div>
                      </div>
                      <div className="text-accent font-medium">+{win.winnings.toFixed(1)} SUI</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Jackpot</p>
                  <p className="font-display font-bold text-xl">
                    {isLoading ? <Skeleton className="h-6 w-20" /> : `${stats?.jackpot || 0} SUI`}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="text-primary h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg p-4 border border-secondary/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Players Online</p>
                  <p className="font-display font-bold text-xl">
                    {isLoading ? <Skeleton className="h-6 w-20" /> : stats?.playersOnline || 0}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Users className="text-secondary h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
