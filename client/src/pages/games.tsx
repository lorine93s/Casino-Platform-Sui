import { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { GameCard } from "@/components/game-card";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dice5, 
  Coins, 
  Dice3, 
  TrendingUp, 
  Search 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Games() {
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter games based on search term
  const filterGames = (games: string[]) => {
    if (!searchTerm) return games;
    return games.filter(game => 
      gameDetails[game as keyof typeof gameDetails].title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gameDetails[game as keyof typeof gameDetails].description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const games = gameTypes || ["slots", "dice", "coinflip", "crash"];
  const filteredGames = filterGames(games);

  return (
    <MainLayout title="Games">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-4">Casino Games</h1>
            <p className="text-slate-300 max-w-3xl">
              Choose from our selection of provably fair blockchain games. Each game offers a unique experience with instant payouts directly to your SUI wallet.
            </p>
          </div>

          <Card className="mb-8 bg-slate-850">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="all">All Games</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : filteredGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredGames.map((gameType) => {
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
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Dice5 className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                  <h3 className="text-xl font-medium text-slate-300 mb-2">No games found</h3>
                  <p className="text-slate-400">Try changing your search term or check back later for new games.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {["slots", "dice"].map((gameType) => {
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
                })}
              </div>
            </TabsContent>

            <TabsContent value="new" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {["crash"].map((gameType) => {
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
                })}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-slate-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-slate-300 mb-2">No favorites yet</h3>
                <p className="text-slate-400">Play some games and mark them as favorites to see them here.</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">Coming Soon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {["blackjack", "roulette", "poker"].map((game, index) => (
                <div 
                  key={index} 
                  className="glassmorphism rounded-xl overflow-hidden border border-slate-700 relative"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">
                      Coming Soon
                    </span>
                  </div>
                  <div className="aspect-[4/3] bg-slate-800 flex flex-col items-center justify-center">
                    <div className="text-5xl mb-4 text-white/30">
                      {index === 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <path d="M17 12a1 1 0 0 0 0 2" />
                          <path d="M12 12a1 1 0 0 0 0 2" />
                          <path d="M7 12a1 1 0 0 0 0 2" />
                        </svg>
                      ) : index === 1 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12">
                          <path d="M2 7v10h20V7" />
                          <path d="M17 11h.01" />
                          <path d="M13 11h.01" />
                          <path d="M9 11h.01" />
                          <path d="M5 11h.01" />
                          <path d="M19.528 7.471C17.536 5.226 14.45 4 12 4c-2.449 0-5.536 1.226-7.528 3.471" />
                        </svg>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="font-display font-semibold text-xl text-white/50">
                        {index === 0 ? "Blackjack" : index === 1 ? "Roulette" : "Poker"}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        {index === 0 ? "Beat the dealer to 21" : index === 1 ? "Bet on lucky numbers" : "Test your poker face"}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-500">
                        <span className="font-medium">Min Bet:</span> TBA
                      </div>
                      <div className="text-sm text-slate-500">
                        <span className="font-medium">Max Win:</span> TBA
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
