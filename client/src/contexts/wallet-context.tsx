import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import suiWallet, { SuiWallet, WALLET_EVENTS } from "@/lib/sui";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, WalletConnection } from "@shared/schema";

interface WalletContextType {
  wallet: SuiWallet | null;
  user: User | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  user: null,
  isConnecting: false,
  connect: async () => {},
  disconnect: async () => {},
  isConnected: false,
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<SuiWallet | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (suiWallet.isConnected()) {
        setWallet(suiWallet.getWallet());
        
        // Fetch user data if we have a wallet
        if (suiWallet.getWallet()?.address) {
          try {
            const response = await apiRequest("GET", `/api/users/wallet/${suiWallet.getWallet()?.address}`);
            const userData = await response.json();
            setUser(userData);
          } catch (error) {
            console.error("Failed to fetch user data:", error);
          }
        }
      }
    };

    checkConnection();
  }, []);

  // Set up wallet event listeners
  useEffect(() => {
    const onConnect = async (connectedWallet: SuiWallet) => {
      setWallet(connectedWallet);
      setIsConnecting(false);
      
      try {
        // Register the wallet with our backend
        const response = await apiRequest("POST", "/api/wallet/connect", { 
          walletAddress: connectedWallet.address 
        });
        
        const data = await response.json();
        setUser(data.user);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${connectedWallet.address.substring(0, 6)}...${connectedWallet.address.substring(connectedWallet.address.length - 4)}`,
        });
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        toast({
          title: "Connection Error",
          description: "Failed to register wallet with the server.",
          variant: "destructive",
        });
      }
    };

    const onDisconnect = () => {
      setWallet(null);
      setUser(null);
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    };

    const onAccountChange = async (address: string) => {
      const currentWallet = suiWallet.getWallet();
      if (currentWallet) {
        setWallet({
          ...currentWallet,
          address,
        });
        
        // Update user data for new address
        try {
          const response = await apiRequest("GET", `/api/users/wallet/${address}`);
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data for new address:", error);
        }
      }
    };

    const onError = (error: Error) => {
      console.error("Wallet error:", error);
      toast({
        title: "Wallet Error",
        description: error.message,
        variant: "destructive",
      });
    };

    // Register event listeners
    const removeConnectListener = suiWallet.on(WALLET_EVENTS.CONNECTED, onConnect);
    const removeDisconnectListener = suiWallet.on(WALLET_EVENTS.DISCONNECTED, onDisconnect);
    const removeAccountChangeListener = suiWallet.on(WALLET_EVENTS.ACCOUNT_CHANGED, onAccountChange);
    const removeErrorListener = suiWallet.on(WALLET_EVENTS.ERROR, onError);

    // Cleanup
    return () => {
      removeConnectListener();
      removeDisconnectListener();
      removeAccountChangeListener();
      removeErrorListener();
    };
  }, [toast]);

  const connect = async () => {
    try {
      setIsConnecting(true);
      
      // Directly connect to the wallet and set state without waiting for event
      const connectedWallet = await suiWallet.connect();
      setWallet(connectedWallet);
      
      try {
        // Register the wallet with our backend
        const response = await apiRequest("POST", "/api/wallet/connect", { 
          walletAddress: connectedWallet.address 
        });
        
        const data = await response.json();
        setUser(data.user);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${connectedWallet.address.substring(0, 6)}...${connectedWallet.address.substring(connectedWallet.address.length - 4)}`,
        });
      } catch (error) {
        console.error("Failed to register wallet:", error);
        toast({
          title: "Registration Note",
          description: "Connected to wallet but couldn't register with server.",
        });
      }
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
      await suiWallet.disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        user,
        isConnecting,
        connect,
        disconnect,
        isConnected: !!wallet && wallet.connected,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
