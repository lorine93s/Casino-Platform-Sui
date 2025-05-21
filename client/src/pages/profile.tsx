import { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  User,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Dice5,
  Clock,
  Coins,
  SlidersVertical,
  TrendingUp,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/contexts/wallet-context";
import { formatAddress, formatCurrency, timeAgo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function Profile() {
  const { wallet, user, connect } = useWallet();
  const { toast } = useToast();
  
  const userId = user?.id;
  
  const { data: profileData, isLoading } = useQuery({
    queryKey: userId ? [`/api/users/${userId}`] : null,
    enabled: !!userId,
    staleTime: 30000, // Refetch after 30 seconds
  });
  
  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  // Game type icons
  const gameIcons = {
    dice: <Dice5 className="h-4 w-4" />,
    coinflip: <Coins className="h-4 w-4" />,
    slots: <SlidersVertical className="h-4 w-4" />,
    crash: <TrendingUp className="h-4 w-4" />
  };

  return (
    <MainLayout title="Profile">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!wallet ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-6">👋</div>
              <h1 className="text-2xl font-display font-bold mb-4">Connect Your Wallet</h1>
              <p className="text-slate-300 mb-6 text-center max-w-md">
                Connect your SUI wallet to view your profile, game history, and stats.
              </p>
              <Button onClick={connect} className="bg-accent hover:bg-accent/90">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-display font-bold mb-4">Your Profile</h1>
                <p className="text-slate-300 max-w-3xl">
                  View your gaming stats, transaction history, and account details.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="bg-slate-850 border-slate-700 lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Your wallet and balance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      
                      <div className="text-center mb-4">
                        <div className="font-display font-bold text-xl">
                          {isLoading ? <Skeleton className="h-7 w-40 mx-auto" /> : user?.username || "Player"}
                        </div>
                        <div className="flex items-center justify-center mt-1 text-sm text-slate-400">
                          {isLoading ? <Skeleton className="h-5 w-32" /> : (
                            <>
                              <span>{formatAddress(wallet.address)}</span>
                              <button onClick={handleCopyAddress} className="ml-1 text-slate-500 hover:text-slate-300">
                                <Copy className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-slate-800 rounded-lg p-4 w-full mb-4">
                        <div className="text-sm text-slate-400 mb-1">Your Balance</div>
                        <div className="flex items-baseline">
                          <span className="font-display font-bold text-2xl">
                            {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(wallet.balance)}
                          </span>
                          <span className="ml-1 text-slate-400">SUI</span>
                        </div>
                        <div className="text-xs text-accent mt-1">
                          ${isLoading ? "0.00" : (wallet.balance * 15).toFixed(2)} USD
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full">
                        <Button variant="outline" className="w-1/2 border-slate-700 bg-slate-800">
                          <ArrowUpRight className="mr-2 h-4 w-4 text-accent" />
                          Deposit
                        </Button>
                        <Button variant="outline" className="w-1/2 border-slate-700 bg-slate-800">
                          <ArrowDownRight className="mr-2 h-4 w-4 text-warning" />
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-850 border-slate-700 lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle>Stats</CardTitle>
                    <CardDescription>Your gaming statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Dice5 className="h-4 w-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-400">Games</span>
                        </div>
                        <div className="font-display font-bold text-2xl">
                          {isLoading ? <Skeleton className="h-8 w-16" /> : profileData?.stats?.gamesPlayed || 0}
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Trophy className="h-4 w-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-400">Wins</span>
                        </div>
                        <div className="font-display font-bold text-2xl">
                          {isLoading ? <Skeleton className="h-8 w-16" /> : profileData?.stats?.wins || 0}
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Wallet className="h-4 w-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-400">Wagered</span>
                        </div>
                        <div className="font-display font-bold text-2xl">
                          {isLoading ? <Skeleton className="h-8 w-16" /> : formatCurrency(profileData?.stats?.totalWagered || 0)}
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Trophy className="h-4 w-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-400">Won</span>
                        </div>
                        <div className="font-display font-bold text-2xl text-accent">
                          {isLoading ? <Skeleton className="h-8 w-16" /> : formatCurrency(profileData?.stats?.totalWinnings || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-warning mr-2" />
                        <div>
                          <div className="text-sm text-slate-400">Leaderboard Position</div>
                          <div className="font-display font-bold text-xl">
                            {isLoading ? <Skeleton className="h-7 w-16" /> : (
                              profileData?.stats?.leaderboardPosition ? 
                                `#${profileData.stats.leaderboardPosition}` : 
                                "Not ranked"
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="border-slate-700">
                        View Leaderboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="games" className="mb-8">
                <TabsList className="bg-slate-800 border border-slate-700">
                  <TabsTrigger value="games">Recent Games</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>

                <TabsContent value="games" className="mt-6">
                  <Card className="bg-slate-850 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Dice5 className="mr-2 h-5 w-5" />
                        Recent Games
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          {Array(5).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      ) : profileData?.recentGames?.length > 0 ? (
                        <div className="space-y-4">
                          {profileData.recentGames.map((game, index) => (
                            <div key={index} className="flex items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                              <div className={`h-10 w-10 rounded-full ${game.isWin ? 'bg-accent/20' : 'bg-slate-700'} flex items-center justify-center mr-4`}>
                                {gameIcons[game.type as keyof typeof gameIcons]}
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between">
                                  <div>
                                    <div className="font-medium">
                                      {game.type.charAt(0).toUpperCase() + game.type.slice(1)}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                      Bet: {formatCurrency(game.bet)} SUI
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={game.isWin ? "text-accent font-medium" : "text-slate-400"}>
                                      {game.isWin ? `+${formatCurrency(game.winnings)}` : `-${formatCurrency(game.bet)}`} SUI
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {timeAgo(game.timestamp)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Dice5 className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                          <h3 className="text-xl font-medium text-slate-300 mb-2">No games yet</h3>
                          <p className="text-slate-400 mb-4">Start playing to see your game history here.</p>
                          <Button asChild className="bg-accent hover:bg-accent/90">
                            <a href="/games">Play Now</a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    {profileData?.recentGames?.length > 0 && (
                      <CardFooter className="border-t border-slate-700 bg-slate-800/50 px-6 py-3">
                        <Button variant="link" className="ml-auto text-accent">
                          View All History
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="transactions" className="mt-6">
                  <Card className="bg-slate-850 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-5 w-5" />
                        Recent Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          {Array(5).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      ) : profileData?.recentTransactions?.length > 0 ? (
                        <div className="space-y-4">
                          {profileData.recentTransactions.map((tx, index) => (
                            <div key={index} className="flex items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                              <div className={`h-10 w-10 rounded-full ${
                                tx.type === 'win' ? 'bg-accent/20' : 
                                tx.type === 'deposit' ? 'bg-primary/20' : 
                                tx.type === 'withdrawal' ? 'bg-secondary/20' : 
                                'bg-slate-700'
                              } flex items-center justify-center mr-4`}>
                                {tx.type === 'win' ? (
                                  <Trophy className="h-4 w-4 text-accent" />
                                ) : tx.type === 'deposit' ? (
                                  <ArrowUpRight className="h-4 w-4 text-primary" />
                                ) : tx.type === 'withdrawal' ? (
                                  <ArrowDownRight className="h-4 w-4 text-secondary" />
                                ) : (
                                  <Dice5 className="h-4 w-4 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between">
                                  <div>
                                    <div className="font-medium">
                                      {tx.type === 'win' ? 'Game Win' : 
                                      tx.type === 'loss' ? 'Game Loss' : 
                                      tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                      {tx.hash ? (
                                        <a 
                                          href={`https://explorer.sui.io/txblock/${tx.hash}`} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center hover:text-accent"
                                        >
                                          {formatAddress(tx.hash)}
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="ml-1 h-3 w-3"
                                          >
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                            <polyline points="15 3 21 3 21 9" />
                                            <line x1="10" y1="14" x2="21" y2="3" />
                                          </svg>
                                        </a>
                                      ) : 'No transaction hash'}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={
                                      tx.amount > 0 ? "text-accent font-medium" : "text-slate-400"
                                    }>
                                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)} SUI
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {timeAgo(tx.timestamp)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Clock className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                          <h3 className="text-xl font-medium text-slate-300 mb-2">No transactions yet</h3>
                          <p className="text-slate-400 mb-4">Your transaction history will appear here.</p>
                        </div>
                      )}
                    </CardContent>
                    {profileData?.recentTransactions?.length > 0 && (
                      <CardFooter className="border-t border-slate-700 bg-slate-800/50 px-6 py-3">
                        <Button variant="link" className="ml-auto text-accent">
                          View All Transactions
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="verification" className="mt-6">
                  <Card className="bg-slate-850 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="mr-2 h-5 w-5" />
                        Provably Fair Verification
                      </CardTitle>
                      <CardDescription>
                        Check the fairness of any game using the client and server seeds
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                          <h3 className="font-medium mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-accent">
                              <path d="M2 12h10M2 12 7 7M2 12l5 5" />
                              <path d="M22 12H12M22 12l-5-5M22 12l-5 5" />
                            </svg>
                            How It Works
                          </h3>
                          <p className="text-sm text-slate-400 mb-2">
                            SUIPlay uses a provably fair system to ensure all game outcomes are random and verifiable:
                          </p>
                          <ol className="text-sm text-slate-400 space-y-2 ml-6 list-decimal">
                            <li>Before each game, we generate a Server Seed (kept secret) and provide you its hash.</li>
                            <li>You provide a Client Seed which you can modify at any time.</li>
                            <li>Game results are generated by combining both seeds and a nonce.</li>
                            <li>After the game, you can verify the result was fair using our verification tool.</li>
                          </ol>
                        </div>

                        <div>
                          <h3 className="font-medium mb-4">Verify a Game</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">Client Seed</label>
                              <input 
                                type="text" 
                                placeholder="Enter client seed"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">Server Seed</label>
                              <input 
                                type="text" 
                                placeholder="Enter revealed server seed"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">Nonce</label>
                              <input 
                                type="number" 
                                placeholder="Enter nonce value"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">Game Type</label>
                              <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-accent">
                                <option value="">Select game type</option>
                                <option value="dice">Dice5</option>
                                <option value="coinflip">Coin Flip</option>
                                <option value="slots">Slots</option>
                                <option value="crash">Crash</option>
                              </select>
                            </div>
                          </div>

                          <Button className="mt-4 bg-accent hover:bg-accent/90">
                            Verify Result
                          </Button>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="font-medium mb-4">Your Current Seeds</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">Current Client Seed</label>
                              <div className="flex">
                                <input 
                                  type="text" 
                                  value={isLoading ? "Loading..." : "a7f9b3c2d1e5f6g8h7i9j0k1l2m3n4o5"}
                                  readOnly
                                  className="flex-grow px-3 py-2 bg-slate-800 border border-slate-700 rounded-l-md focus:outline-none"
                                />
                                <Button variant="outline" className="rounded-l-none border border-l-0 border-slate-700">
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">Current Server Seed Hash</label>
                              <div className="flex">
                                <input 
                                  type="text" 
                                  value={isLoading ? "Loading..." : "8f5a31b2e9c7d4f6a2b1c8d7e3f5a9b2c8d7e3f5a9b2c8d7e3f5a9b2c8d7e3f5"}
                                  readOnly
                                  className="flex-grow px-3 py-2 bg-slate-800 border border-slate-700 rounded-l-md focus:outline-none"
                                />
                                <Button variant="outline" className="rounded-l-none border border-l-0 border-slate-700">
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                The server seed will be revealed after you change your client seed.
                              </p>
                            </div>

                            <div>
                              <label className="text-sm text-slate-400 mb-1 block">New Client Seed</label>
                              <div className="flex">
                                <input 
                                  type="text" 
                                  placeholder="Enter a new client seed or generate a random one"
                                  className="flex-grow px-3 py-2 bg-slate-800 border border-slate-700 rounded-l-md focus:outline-none"
                                />
                                <Button variant="outline" className="rounded-l-none border border-l-0 border-slate-700">
                                  Generate
                                </Button>
                              </div>
                            </div>

                            <Button className="bg-primary hover:bg-primary/90">
                              Change Client Seed
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
