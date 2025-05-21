import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Plus } from "lucide-react";
import { formatBalance } from "@/lib/utils";
import { walletService, CasinoWalletState } from "@/lib/wallet-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface WalletButtonProps {
  className?: string;
}

export function WalletButton({ className }: WalletButtonProps) {
  const [wallet, setWallet] = useState<CasinoWalletState>(walletService.getState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("10");
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to wallet state changes
    const unsubscribe = walletService.subscribe((newState) => {
      console.log("Wallet state updated:", newState);
      setWallet(newState);
    });
    
    return unsubscribe;
  }, []);

  const connect = async () => {
    try {
      setIsConnecting(true);
      const result = await walletService.connect();
      
      toast({
        title: "Wallet Connected",
        description: `Connected with address ${result.address?.substring(0, 6)}...${result.address?.substring(result.address.length - 4)}`,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await walletService.disconnect();
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    try {
      await walletService.addFunds(amount);
      setDepositDialogOpen(false);
      setDepositAmount("10");
      
      toast({
        title: "Deposit Successful",
        description: `Added ${amount} SUI to your wallet.`,
      });
    } catch (error) {
      console.error("Failed to add funds:", error);
      toast({
        title: "Deposit Failed",
        description: "Failed to add funds to your wallet.",
        variant: "destructive",
      });
    }
  };

  if (!wallet.connected) {
    return (
      <Button 
        onClick={connect}
        disabled={isConnecting}
        className={`bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg ${className}`}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`bg-slate-800 border-slate-700 hover:bg-slate-700 ${className}`}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {formatBalance(wallet.balance || 0)} SUI
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white">
          <DropdownMenuItem className="focus:bg-slate-700" onClick={() => setDepositDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Deposit Funds</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem className="focus:bg-slate-700" onClick={disconnect}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add SUI to your wallet for testing the casino games.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="col-span-3 bg-slate-900 border-slate-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleDeposit}
              className="bg-accent hover:bg-accent/90"
            >
              Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
