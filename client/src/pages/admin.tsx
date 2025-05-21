import { useState, useEffect } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { CasinoStats } from "@/components/casino-stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { casinoWallet } from "@/lib/casino-wallet";
import { formatCurrency } from "@/lib/utils";
import { Coins, BadgeDollarSign, TrendingUp, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export default function AdminPage() {
  const [showTransactions, setShowTransactions] = useState(false);
  const [casinoStats, setCasinoStats] = useState(casinoWallet.getStats());
  const [newHouseEdge, setNewHouseEdge] = useState("2");
  const [fundAmount, setFundAmount] = useState("1000");
  const { toast } = useToast();
  const { wallet, isConnected } = useWallet();

  useEffect(() => {
    // Subscribe to casino wallet updates
    const unsubscribe = casinoWallet.subscribe(() => {
      setCasinoStats(casinoWallet.getStats());
    });
    return () => unsubscribe();
  }, []);

  // Mock transactions for admin view
  const recentTransactions = [
    { id: 1, type: "bet", amount: -50, game: "Dice", player: "0xc45d...8a2b", timestamp: new Date(Date.now() - 5000000) },
    { id: 2, type: "win", amount: 125, game: "Slots", player: "0x72a3...f41c", timestamp: new Date(Date.now() - 3600000) },
    { id: 3, type: "bet", amount: -10, game: "Coinflip", player: "0x39b6...1e5d", timestamp: new Date(Date.now() - 1800000) },
    { id: 4, type: "loss", amount: 20, game: "Crash", player: "0x51f7...9c3e", timestamp: new Date(Date.now() - 900000) },
    { id: 5, type: "deposit", amount: 5000, game: "-", player: "ADMIN", timestamp: new Date(Date.now() - 600000) },
  ];

  const handleFundCasino = () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return;

    // This would be an admin-only action to add funds to the casino wallet
    // In a real implementation, this would require proper authentication
    casinoWallet.getState().balance += amount;
    
    toast({
      title: "Casino Funded",
      description: `Added ${formatCurrency(amount)} SUI to the casino balance`,
    });
  };

  const handleUpdateHouseEdge = () => {
    const edge = parseFloat(newHouseEdge);
    if (isNaN(edge) || edge < 0 || edge > 10) return;

    // This would update the house edge in a real implementation
    toast({
      title: "House Edge Updated",
      description: `House edge set to ${edge}%`,
    });
  };

  return (
    <MainLayout title="Casino Admin">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold font-display text-white">Casino Admin Dashboard</h1>
          {isConnected && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm">
              Admin: {wallet?.address.substring(0, 6)}...{wallet?.address.substring(wallet?.address.length - 4)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-850 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display flex items-center">
                <Coins className="mr-2 h-5 w-5 text-primary" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(casinoStats.currentBalance)} SUI
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Casino reserve funds
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-850 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-accent" />
                Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${casinoStats.profitLoss >= 0 ? "text-accent" : "text-destructive"}`}>
                {casinoStats.profitLoss >= 0 ? "+" : ""}{formatCurrency(casinoStats.profitLoss)} SUI
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Total earnings since launch
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-850 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display flex items-center">
                <BadgeDollarSign className="mr-2 h-5 w-5 text-warning" />
                Wagered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(casinoStats.totalWagered)} SUI
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Total volume of bets placed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-display">Recent Transactions</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowTransactions(!showTransactions)}
                    className="bg-slate-800 border-slate-700"
                  >
                    {showTransactions ? 
                      <ChevronUp className="h-4 w-4 mr-1" /> : 
                      <ChevronDown className="h-4 w-4 mr-1" />
                    }
                    {showTransactions ? "Hide" : "Show"}
                  </Button>
                </div>
                <CardDescription>
                  Recent activity in the casino
                </CardDescription>
              </CardHeader>
              {showTransactions && (
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-slate-800/50">
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-slate-800/50">
                          <TableCell className="font-medium">
                            <span className={
                              tx.type === "win" || tx.type === "deposit" 
                                ? "text-accent" 
                                : tx.type === "loss" 
                                ? "text-primary" 
                                : "text-destructive"
                            }>
                              {tx.type}
                            </span>
                          </TableCell>
                          <TableCell>{tx.game}</TableCell>
                          <TableCell>{tx.player}</TableCell>
                          <TableCell className="text-right">
                            <span className={tx.amount > 0 ? "text-accent" : "text-destructive"}>
                              {tx.amount > 0 ? "+" : ""}{tx.amount} SUI
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {tx.timestamp.toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
            
            <Card className="bg-slate-850 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="font-display flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Performance Stats
                </CardTitle>
                <CardDescription>
                  Key metrics and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">House Edge</div>
                      <div className="text-xl font-bold">{casinoStats.houseEdge}</div>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">Paid Out</div>
                      <div className="text-xl font-bold">{formatCurrency(casinoStats.totalPaidOut)} SUI</div>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">RTP (Return to Player)</div>
                      <div className="text-xl font-bold">
                        {casinoStats.totalWagered > 0 
                          ? ((casinoStats.totalPaidOut / casinoStats.totalWagered) * 100).toFixed(2)
                          : "0.00"}%
                      </div>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">Profit Margin</div>
                      <div className="text-xl font-bold">
                        {casinoStats.totalWagered > 0 
                          ? ((casinoStats.profitLoss / casinoStats.totalWagered) * 100).toFixed(2)
                          : "0.00"}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="font-display">Admin Controls</CardTitle>
                <CardDescription>
                  Manage casino settings and funds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="house-edge">House Edge (%)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="house-edge"
                      type="number"
                      placeholder="2.0"
                      value={newHouseEdge}
                      onChange={(e) => setNewHouseEdge(e.target.value)}
                      className="bg-slate-900 border-slate-700"
                    />
                    <Button onClick={handleUpdateHouseEdge} className="bg-primary hover:bg-primary/90">
                      Update
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="fund-amount">Add Funds (SUI)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="fund-amount"
                      type="number"
                      placeholder="1000"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="bg-slate-900 border-slate-700"
                    />
                    <Button onClick={handleFundCasino} className="bg-accent hover:bg-accent/90">
                      Fund
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <CasinoStats className="mt-6" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}