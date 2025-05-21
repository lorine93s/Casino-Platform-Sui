import { useWallet } from "@/contexts/wallet-context";
import { formatAddress, formatBalance } from "@/lib/utils";

interface ConnectedWalletProps {
  className?: string;
}

export function ConnectedWallet({ className }: ConnectedWalletProps) {
  const { wallet, isConnected, user } = useWallet();
  
  if (!isConnected || !wallet) {
    return null;
  }
  
  // Convert balance to USD (simulated)
  const usdRate = 15; // 1 SUI = $15 USD
  const usdBalance = wallet.balance * usdRate;

  return (
    <div className={`glassmorphism rounded-lg p-2 flex items-center ${className}`}>
      <div className="bg-slate-700 rounded-full p-1 mr-3">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-4 w-4 text-accent"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div className="mr-3">
        <div className="text-sm font-medium truncate">
          {formatAddress(wallet.address)}
        </div>
        <div className="text-xs text-slate-400 flex items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-accent mr-1"></div>
          <span>Connected</span>
        </div>
      </div>
      <div className="border-l border-slate-600 pl-3">
        <div className="text-sm font-medium">{formatBalance(wallet.balance)} SUI</div>
        <div className="text-xs text-accent">${formatBalance(usdBalance)} USD</div>
      </div>
    </div>
  );
}
