import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Plus, ExternalLink } from "lucide-react";
import { formatBalance } from "@/lib/utils";
import { realWalletService, SuiWalletState } from "@/lib/real-wallet";
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
  const [wallet, setWallet] = useState<SuiWalletState>(realWalletService.getState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [extensionMissing, setExtensionMissing] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("10");
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet extension is available
    setExtensionMissing(!realWalletService.isSuiWalletAvailable());

    // Subscribe to wallet state changes
    const unsubscribe = realWalletService.subscribe((newState) => {
      console.log("Wallet state updated:", newState);
      setWallet(newState);
    });
    
    return unsubscribe;
  }, []);

  const connect = async () => {
    if (extensionMissing) {
      window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank');
      toast({
        title: "SUI Wallet Required",
        description: "Please install the SUI Wallet extension and refresh the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      const result = await realWalletService.connect();
      
      toast({
        title: "Wallet Connected",
        description: `Connected with address ${result.address?.substring(0, 6)}...${result.address?.substring(result.address.length - 4)}`,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to SUI wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await realWalletService.disconnect();
      
      toast({
        title: "Wallet Disconnected",
        description: "Your SUI wallet has been disconnected.",
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const handleDeposit = async () => {
    toast({
      title: "Deposit Information",
      description: "To get SUI tokens, please use the SUI faucet in your wallet extension.",
    });
    setDepositDialogOpen(false);
  };

  // Installation prompt when the SUI wallet extension is missing
  if (extensionMissing) {
    return (
      <Button 
        onClick={() => window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank')}
        className={`bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg ${className}`}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Install SUI Wallet
      </Button>
    );
  }

  // Regular connect button when not connected
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

  // Connected state with wallet information
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
          <DropdownMenuItem className="focus:bg-slate-700" onClick={() => window.open('https://allowlist.sui.io/faucet', '_blank')}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Visit SUI Faucet</span>
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
            <DialogTitle>Get SUI Tokens</DialogTitle>
            <DialogDescription className="text-slate-400">
              To get SUI tokens for testing, you need to use the official SUI faucet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-slate-300">
              The SUI blockchain uses its native token for transactions. You can get test tokens from 
              the official SUI faucet website or directly through your SUI wallet extension.
            </p>
            
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => window.open('https://allowlist.sui.io/faucet', '_blank')}
                className="bg-accent hover:bg-accent/90"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open SUI Faucet
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setDepositDialogOpen(false)}
              className="bg-slate-700 hover:bg-slate-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
