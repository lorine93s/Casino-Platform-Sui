import { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Clock, 
  User,
  Dice5, 
  Coins, 
  SlidersVertical, 
  TrendingUp,
  Filter
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState("24h");
  
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
    <MainLayout title="Leaderboard">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-4">Leaderboard</h1>
            <p className="text-slate-300 max-w-3xl">
              Check out who's winning big on SUIPlay. The leaderboard shows the top players based on their net profit.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex items-center">
              <Trophy className="text-warning mr-2 h-5 w-5" />
              <h2 className="text-xl font-display font-semibold">Top Players</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400 h-4 w-4" />
              <span className="text-sm text-slate-400 mr-2">Time Period:</span>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last Week</SelectItem>
                  <SelectItem value="30d">Last Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="all">All Games</TabsTrigger>
              <TabsTrigger value="dice">Dice5</TabsTrigger>
              <TabsTrigger value="coinflip">Coin Flip</TabsTrigger>
              <TabsTrigger value="slots">Slots</TabsTrigger>
              <TabsTrigger value="crash">Crash</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Card className="bg-slate-850 border-slate-700">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800 text-slate-300 text-sm">
                        <tr>
                          <th className="p-4 w-16">#</th>
                          <th className="p-4">Player</th>
                          <th className="p-4">Games</th>
                          <th className="p-4">Net Profit</th>
                          <th className="p-4">Favorite Game</th>
                          <th className="p-4">Win Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {isLoading ? (
                          Array(10).fill(0).map((_, index) => (
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
                              <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                            </tr>
                          ))
                        ) : (
                          (leaderboard || []).map((entry, index) => {
                            // Calculate a mock win rate between 30% and 95%
                            const winRate = 30 + Math.floor(Math.random() * 65);
                            
                            return (
                              <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 font-semibold">
                                  {index === 0 ? (
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-warning/20">
                                      <Trophy className="h-4 w-4 text-warning" />
                                    </div>
                                  ) : index === 1 ? (
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary/20">
                                      <Medal className="h-4 w-4 text-secondary" />
                                    </div>
                                  ) : index === 2 ? (
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent/20">
                                      <Medal className="h-4 w-4 text-accent" />
                                    </div>
                                  ) : (
                                    index + 1
                                  )}
                                </td>
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
                                <td className="p-4">
                                  <Badge variant="outline" className="bg-slate-800 text-slate-300">
                                    {winRate}%
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {["dice", "coinflip", "slots", "crash"].map((gameType) => (
              <TabsContent key={gameType} value={gameType} className="mt-6">
                <Card className="bg-slate-850 border-slate-700">
                  <CardContent className="p-6 text-center">
                    <div className="py-8">
                      {gameIcons[gameType as keyof typeof gameIcons]}
                      <h3 className="text-xl font-medium text-slate-300 mt-4 mb-2">
                        {gameType.charAt(0).toUpperCase() + gameType.slice(1)} Leaderboard
                      </h3>
                      <p className="text-slate-400 mb-4">Leaderboard filtered by {gameType} games will be available soon.</p>
                      <Badge variant="outline" className="bg-primary/20 text-primary">
                        Coming Soon
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-12">
            <div className="flex items-center mb-6">
              <Clock className="text-secondary mr-2 h-5 w-5" />
              <h2 className="text-xl font-display font-semibold">Historical Winners</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["Last Month", "Last Season", "All Time"].map((period, index) => (
                <Card key={index} className="bg-slate-850 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      {index === 0 ? (
                        <Clock className="mr-2 h-5 w-5 text-slate-400" />
                      ) : index === 1 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-slate-400">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      ) : (
                        <Trophy className="mr-2 h-5 w-5 text-slate-400" />
                      )}
                      {period}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((pos) => (
                        <div key={pos} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex items-center">
                            <div className="font-bold text-lg w-6 text-center mr-3">{pos}</div>
                            <div className={`h-8 w-8 rounded-full ${Object.values(avatarColors)[Math.floor(Math.random() * 5)]} flex items-center justify-center mr-2`}>
                              <User className={`${Object.values(avatarTextColors)[Math.floor(Math.random() * 5)]} text-sm h-4 w-4`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {formatAddress(`0x${Math.random().toString(16).substring(2, 14)}`)}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center">
                                {Object.values(gameIcons)[Math.floor(Math.random() * 4)]}
                                <span>{Object.keys(gameIcons)[Math.floor(Math.random() * 4)]}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-accent font-medium">
                            +{(1000 + Math.random() * 10000).toFixed(1)} SUI
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-center">
                      <Badge variant="outline" className="bg-slate-800">
                        View All
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
