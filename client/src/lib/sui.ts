// SUI Blockchain Integration Library
// This is a simplified implementation for demonstration purposes.
// In a real application, you would use the SUI SDK.

// Mock wallet structure for demonstration
export interface SuiWallet {
  address: string;
  balance: number;
  connected: boolean;
}

// Available wallets
const AVAILABLE_WALLETS = ['SUI Wallet', 'Martian Wallet', 'Ethos Wallet', 'Suiet'];

// Event names
export const WALLET_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ACCOUNT_CHANGED: 'accountChanged',
  CHAIN_CHANGED: 'chainChanged',
  ERROR: 'error',
};

class SuiWalletProvider {
  private wallet: SuiWallet | null = null;
  private listeners: Map<string, Function[]> = new Map();
  
  constructor() {
    console.log("SuiWalletProvider initialized");
    this.initListeners();
  }
  
  private initListeners() {
    // Initialize event listeners map
    Object.values(WALLET_EVENTS).forEach(event => {
      this.listeners.set(event, []);
    });
    
    // Check if we have a stored wallet in localStorage
    const storedWallet = localStorage.getItem('suiWallet');
    if (storedWallet) {
      try {
        this.wallet = JSON.parse(storedWallet);
        // Only restore if it was connected
        if (this.wallet && this.wallet.connected) {
          // Emit connected event on next tick to allow listeners to register
          setTimeout(() => {
            this.emit(WALLET_EVENTS.CONNECTED, this.wallet);
          }, 0);
        }
      } catch (e) {
        console.error('Failed to parse stored wallet:', e);
        localStorage.removeItem('suiWallet');
      }
    }
    
    // Simulate window events from wallet extensions (for real wallet integration)
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'suiWalletEvent') {
        this.emit(event.data.name, event.data.data);
      }
    });
  }
  
  public on(eventName: string, callback: Function) {
    const listeners = this.listeners.get(eventName) || [];
    listeners.push(callback);
    this.listeners.set(eventName, listeners);
    
    return () => {
      const updatedListeners = this.listeners.get(eventName) || [];
      this.listeners.set(
        eventName,
        updatedListeners.filter(listener => listener !== callback)
      );
    };
  }
  
  private emit(eventName: string, data?: any) {
    const listeners = this.listeners.get(eventName) || [];
    listeners.forEach(listener => listener(data));
  }
  
  public async connect(walletName = 'SUI Wallet'): Promise<SuiWallet> {
    if (this.wallet && this.wallet.connected) {
      return this.wallet;
    }
    
    try {
      // In a real app, this would call the wallet's connect method
      // For our demo, we'll simulate a successful connection
      
      // Generate a random wallet address
      const address = `0x${Math.random().toString(16).substring(2, 14)}`;
      
      // Simulate a random balance between 10 and 100 SUI
      const balance = 10 + Math.random() * 90;
      
      this.wallet = {
        address,
        balance,
        connected: true,
      };
      
      // Save to localStorage for persistence
      localStorage.setItem('suiWallet', JSON.stringify(this.wallet));
      
      // Emit connection event
      this.emit(WALLET_EVENTS.CONNECTED, this.wallet);
      
      console.log('Wallet connected successfully:', this.wallet);
      return this.wallet;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      this.emit(WALLET_EVENTS.ERROR, error);
      throw error;
    }
  }
  
  public async disconnect(): Promise<void> {
    if (!this.wallet) {
      return;
    }
    
    this.wallet.connected = false;
    
    // Remove from localStorage
    localStorage.removeItem('suiWallet');
    
    // Emit disconnection event
    this.emit(WALLET_EVENTS.DISCONNECTED);
    console.log('Wallet disconnected');
  }
  
  public isConnected(): boolean {
    return !!this.wallet && this.wallet.connected;
  }
  
  public getWallet(): SuiWallet | null {
    return this.wallet;
  }
  
  public async getBalance(): Promise<number> {
    if (!this.wallet || !this.wallet.connected) {
      throw new Error('Wallet not connected');
    }
    
    return this.wallet.balance;
  }
  
  public async getAvailableWallets(): Promise<string[]> {
    return AVAILABLE_WALLETS;
  }
  
  public async executeMoveCall(params: any): Promise<string> {
    if (!this.wallet || !this.wallet.connected) {
      throw new Error('Wallet not connected');
    }
    
    // In a real app, this would call the wallet's signAndExecuteTransaction method
    // For our demo, we'll simulate a successful transaction
    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    
    // Update the wallet balance based on transaction amount
    // In a real app, this would come from blockchain events
    if (params.amount && typeof params.amount === 'number') {
      this.wallet.balance -= params.amount;
      
      // Ensure balance doesn't go below 0
      if (this.wallet.balance < 0) {
        this.wallet.balance = 0;
      }
    }
    
    return txHash;
  }
  
  public async addFunds(amount: number): Promise<void> {
    if (!this.wallet || !this.wallet.connected) {
      throw new Error('Wallet not connected');
    }
    
    // In a real app, this would be a deposit transaction
    // For our demo, we'll simply update the balance
    this.wallet.balance += amount;
  }
}

// Create a single instance of the wallet provider
export const suiWallet = new SuiWalletProvider();

export default suiWallet;
