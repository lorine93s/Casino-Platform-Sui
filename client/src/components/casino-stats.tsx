import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { casinoWallet } from "@/lib/casino-wallet";
import { Badge } from "@/components/ui/badge";
import { Building2, Coins, TrendingUp } from "lucide-react";

interface CasinoStatsProps {
  className?: string;
}

export function CasinoStats({ className }: CasinoStatsProps) {
  const [stats, setStats] = useState(casinoWallet.getStats());
  
  useEffect(() => {
    // Subscribe to casino wallet updates
    const unsubscribe = casinoWallet.subscribe(() => {
      setStats(casinoWallet.getStats());
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <Card className={`bg-slate-850 border-slate-700 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-display">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          Casino Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center">
            <Coins className="mr-1 h-4 w-4" />
            House Balance
          </span>
          <span className="font-semibold">{formatCurrency(stats.currentBalance)} SUI</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Wagered</span>
          <span className="font-semibold">{formatCurrency(stats.totalWagered)} SUI</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Paid Out</span>
          <span className="font-semibold">{formatCurrency(stats.totalPaidOut)} SUI</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center">
            <TrendingUp className="mr-1 h-4 w-4" />
            House Edge
          </span>
          <Badge variant="outline" className="bg-accent/10 text-accent">
            {stats.houseEdge}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Profit/Loss</span>
          <Badge 
            variant="outline" 
            className={stats.profitLoss >= 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}
          >
            {stats.profitLoss >= 0 ? "+" : ""}{formatCurrency(stats.profitLoss)} SUI
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}