import { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Clock,
  Search,
  Filter,
  Dice5, 
  Coins, 
  SlidersVertical, 
  TrendingUp,
  Copy,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/contexts/wallet-context";
import { formatAddress, formatCurrency, timeAgo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { motion } from "framer-motion";

export default function History() {
  const { wallet, user, connect } = useWallet();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  
  const userId = user?.id;
  
  const { data: games, isLoading } = useQuery({
    queryKey: userId ? [`/api/games/user/${userId}`] : null,
    enabled: !!userId,
    staleTime: 30000, // Refetch after 30 seconds
  });

  // Game type icons
  const gameIcons = {
    dice: <Dice5 className="h-4 w-4" />,
    coinflip: <Coins className="h-4 w-4" />,
    slots: <SlidersVertical className="h-4 w-4" />,
    crash: <TrendingUp className="h-4 w-4" />
  };

  // Filter games based on search, time, and game type
  const filteredGames = games ? games.filter(game => {
    let passesSearch = true;
    let passesTimeFilter = true;
    let passesGameFilter = true;
    
    // Search filter
    if (searchTerm) {
      passesSearch = 
        game.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.id.toString().includes(searchTerm);
    }
    
    // Time filter
    if (timeFilter !== "all") {
      const gameDate = new Date(game.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - gameDate.getTime()) / (1000 * 3600 * 24);
      
      if (timeFilter === "24h" && daysDiff > 1) passesTimeFilter = false;
      if (timeFilter === "7d" && daysDiff > 7) passesTimeFilter = false;
      if (timeFilter === "30d" && daysDiff > 30) passesTimeFilter = false;
    }
    
    // Game type filter
    if (gameFilter !== "all") {
      passesGameFilter = game.type === gameFilter;
    }
    
    return passesSearch && passesTimeFilter && passesGameFilter;
  }) : [];

  return (
    <MainLayout title="Game History">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!wallet ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-6">⏱️</div>
              <h1 className="text-2xl font-display font-bold mb-4">Connect Your Wallet</h1>
              <p className="text-slate-300 mb-6 text-center max-w-md">
                Connect your SUI wallet to view your game history and transaction details.
              </p>
              <Button onClick={connect} className="bg-accent hover:bg-accent/90">
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
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                </svg>
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-display font-bold mb-4">Game History</h1>
                <p className="text-slate-300 max-w-3xl">
                  View your complete game history and transaction details. Verify any game's fairness using the provided seeds.
                </p>
              </div>

              <Card className="bg-slate-850 border-slate-700 mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input
                        placeholder="Search by game type or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-700"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <Select value={timeFilter} onValueChange={setTimeFilter}>
                          <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                            <SelectValue placeholder="Time Period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="24h">Last 24H</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Dice5 className="h-5 w-5 text-slate-400" />
                        <Select value={gameFilter} onValueChange={setGameFilter}>
                          <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                            <SelectValue placeholder="Game Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Games</SelectItem>
                            <SelectItem value="dice">Dice5</SelectItem>
                            <SelectItem value="coinflip">Coin Flip</SelectItem>
                            <SelectItem value="slots">Slots</SelectItem>
                            <SelectItem value="crash">Crash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="all" className="mb-8">
                <TabsList className="bg-slate-800 border border-slate-700">
                  <TabsTrigger value="all">All Games</TabsTrigger>
                  <TabsTrigger value="wins">Wins</TabsTrigger>
                  <TabsTrigger value="losses">Losses</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  {renderGamesTable(filteredGames, isLoading)}
                </TabsContent>

                <TabsContent value="wins" className="mt-6">
                  {renderGamesTable(filteredGames?.filter(game => game.isWin) || [], isLoading)}
                </TabsContent>

                <TabsContent value="losses" className="mt-6">
                  {renderGamesTable(filteredGames?.filter(game => !game.isWin) || [], isLoading)}
                </TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );

  function renderGamesTable(gamesToRender: any[], loading: boolean) {
    if (loading) {
      return (
        <Card className="bg-slate-850 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-300 text-sm">
                  <tr>
                    <th className="p-4">Game ID</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Bet Amount</th>
                    <th className="p-4">Multiplier</th>
                    <th className="p-4">Result</th>
                    <th className="p-4">Time</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (gamesToRender.length === 0) {
      return (
        <Card className="bg-slate-850 border-slate-700">
          <CardContent className="p-6 text-center py-16">
            <Clock className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No games found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || timeFilter !== "all" || gameFilter !== "all" 
                ? "Try changing your search filters."
                : "Start playing to see your game history here."}
            </p>
            {!searchTerm && timeFilter === "all" && gameFilter === "all" && (
              <Button asChild className="bg-accent hover:bg-accent/90">
                <a href="/games">Play Now</a>
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-slate-850 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-slate-300 text-sm">
                <tr>
                  <th className="p-4">Game ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Bet Amount</th>
                  <th className="p-4">Multiplier</th>
                  <th className="p-4">Result</th>
                  <th className="p-4">Time</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {gamesToRender.map((game, index) => (
                  <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">#{game.id}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full ${
                          game.type === 'dice' ? 'bg-primary/20' :
                          game.type === 'coinflip' ? 'bg-secondary/20' :
                          game.type === 'slots' ? 'bg-accent/20' :
                          'bg-warning/20'
                        } flex items-center justify-center mr-2`}>
                          {gameIcons[game.type as keyof typeof gameIcons]}
                        </div>
                        <span>{game.type.charAt(0).toUpperCase() + game.type.slice(1)}</span>
                      </div>
                    </td>
                    <td className="p-4">{formatCurrency(game.bet)} SUI</td>
                    <td className="p-4">{game.multiplier}x</td>
                    <td className="p-4">
                      {game.isWin ? (
                        <Badge className="bg-accent/20 text-accent">
                          +{formatCurrency(game.winnings)} SUI
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive">
                          -{formatCurrency(game.bet)} SUI
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">{timeAgo(game.timestamp)}</td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700">
                        Verify
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }
}
