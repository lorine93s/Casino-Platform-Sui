// Real SUI Wallet Integration
// This file interfaces with the actual Sui Wallet browser extension

export interface SuiWalletState {
  address: string | null;
  balance: number;
  connected: boolean;
}

type WalletListener = (state: SuiWalletState) => void;

class RealWalletService {
  private state: SuiWalletState;
  private listeners: WalletListener[] = [];
  
  constructor() {
    this.state = {
      address: null,
      balance: 0,
      connected: false
    };
    
    // Check if window.suiWallet exists when the page loads
    this.checkExtensionAvailability();
  }
  
  private checkExtensionAvailability() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'complete') {
      this.initializeExtensionListener();
    } else {
      window.addEventListener('load', () => this.initializeExtensionListener());
    }
  }
  
  private initializeExtensionListener() {
    // Give the extension time to inject itself
    setTimeout(() => {
      if (this.isSuiWalletAvailable()) {
        console.log('SUI Wallet extension detected');
        
        // Check if we're already connected (from a previous session)
        this.checkExistingConnection();
      } else {
        console.log('SUI Wallet extension not detected');
      }
    }, 500);
  }
  
  private async checkExistingConnection() {
    if (!this.isSuiWalletAvailable()) return;
    
    try {
      // @ts-ignore - window.suiWallet is injected by the browser extension
      const accounts = await window.suiWallet?.getAccounts();
      if (accounts && accounts.length > 0) {
        // We have a connected account
        const address = accounts[0];
        console.log('Found connected wallet:', address);
        
        // Get the balance
        this.updateState({
          address,
          balance: await this.fetchBalance(address),
          connected: true
        });
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
    }
  }
  
  public isSuiWalletAvailable(): boolean {
    // @ts-ignore - window.suiWallet is injected by the browser extension
    return typeof window.suiWallet !== 'undefined';
  }
  
  private async fetchBalance(address: string): Promise<number> {
    try {
      // In a real implementation, this would use the SUI RPC API
      // For now, return a simulated balance
      return 1000;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }
  
  public async connect(): Promise<SuiWalletState> {
    if (!this.isSuiWalletAvailable()) {
      throw new Error('SUI Wallet extension not detected. Please install the browser extension.');
    }
    
    try {
      console.log('Requesting connection to SUI Wallet...');
      
      // Request connection to the wallet
      // @ts-ignore - window.suiWallet is injected by the browser extension
      const accounts = await window.suiWallet?.requestPermissions();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }
      
      const address = accounts[0];
      console.log('Connected to wallet:', address);
      
      // Update state with connected wallet info
      this.updateState({
        address,
        balance: await this.fetchBalance(address),
        connected: true
      });
      
      return this.getState();
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  }
  
  public async disconnect(): Promise<void> {
    if (!this.isSuiWalletAvailable() || !this.state.connected) {
      return;
    }
    
    try {
      // Some wallets provide a disconnect method
      // @ts-ignore - window.suiWallet is injected by the browser extension
      if (typeof window.suiWallet?.disconnect === 'function') {
        // @ts-ignore
        await window.suiWallet.disconnect();
      }
      
      this.updateState({
        address: null,
        balance: 0,
        connected: false
      });
      
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }
  
  public async refreshBalance(): Promise<number> {
    if (!this.state.connected || !this.state.address) {
      throw new Error('Wallet not connected');
    }
    
    const balance = await this.fetchBalance(this.state.address);
    
    this.updateState({
      ...this.state,
      balance
    });
    
    return balance;
  }
  
  public getState(): SuiWalletState {
    return { ...this.state };
  }
  
  public subscribe(listener: WalletListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private updateState(newState: Partial<SuiWalletState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }
  
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }
}

// Create a singleton instance
export const realWalletService = new RealWalletService();