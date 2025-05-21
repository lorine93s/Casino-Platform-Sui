import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Plus } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import { formatBalance } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
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
import suiWallet from "@/lib/sui";

interface WalletButtonProps {
  className?: string;
}

export function WalletButton({ className }: WalletButtonProps) {
  const { isConnected, connect, disconnect, wallet, isConnecting } = useWallet();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("10");

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    try {
      await suiWallet.addFunds(amount);
      setDepositDialogOpen(false);
      setDepositAmount("10");
    } catch (error) {
      console.error("Failed to add funds:", error);
    }
  };

  if (!isConnected) {
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
            {formatBalance(wallet?.balance || 0)} SUI
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
