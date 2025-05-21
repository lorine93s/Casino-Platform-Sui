// Simple wallet implementation for the casino platform

export interface CasinoWalletState {
  address: string | null;
  balance: number;
  connected: boolean;
}

type WalletListener = (state: CasinoWalletState) => void;

class WalletService {
  private state: CasinoWalletState;
  private listeners: WalletListener[] = [];
  
  constructor() {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem('casinoWalletState');
    
    if (savedState) {
      try {
        this.state = JSON.parse(savedState);
        console.log('Loaded wallet state:', this.state);
      } catch (e) {
        console.error('Failed to parse saved wallet state:', e);
        this.state = this.getInitialState();
      }
    } else {
      this.state = this.getInitialState();
    }
  }
  
  private getInitialState(): CasinoWalletState {
    return {
      address: null,
      balance: 0,
      connected: false
    };
  }
  
  public getState(): CasinoWalletState {
    return { ...this.state };
  }
  
  public isConnected(): boolean {
    return this.state.connected;
  }
  
  public async connect(): Promise<CasinoWalletState> {
    console.log('Connecting wallet...');
    
    // Create a simulated wallet with random address and balance
    this.state = {
      address: `0x${Math.random().toString(16).substring(2, 14)}`,
      balance: 100 + Math.round(Math.random() * 900), // Random balance between 100-1000
      connected: true
    };
    
    // Save to localStorage
    this.saveState();
    
    // Notify listeners
    this.notifyListeners();
    
    console.log('Wallet connected:', this.state);
    return this.getState();
  }
  
  public async disconnect(): Promise<void> {
    console.log('Disconnecting wallet...');
    
    this.state = this.getInitialState();
    localStorage.removeItem('casinoWalletState');
    
    // Notify listeners
    this.notifyListeners();
    
    console.log('Wallet disconnected');
  }
  
  public async addFunds(amount: number): Promise<CasinoWalletState> {
    if (!this.state.connected) {
      throw new Error('Wallet not connected');
    }
    
    this.state.balance += amount;
    this.saveState();
    this.notifyListeners();
    
    return this.getState();
  }
  
  public async placeBet(amount: number): Promise<boolean> {
    if (!this.state.connected) {
      throw new Error('Wallet not connected');
    }
    
    if (this.state.balance < amount) {
      return false;
    }
    
    this.state.balance -= amount;
    this.saveState();
    this.notifyListeners();
    
    return true;
  }
  
  public async receiveWinnings(amount: number): Promise<CasinoWalletState> {
    if (!this.state.connected) {
      throw new Error('Wallet not connected');
    }
    
    this.state.balance += amount;
    this.saveState();
    this.notifyListeners();
    
    return this.getState();
  }
  
  private saveState(): void {
    localStorage.setItem('casinoWalletState', JSON.stringify(this.state));
  }
  
  public subscribe(listener: WalletListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }
}

// Create a singleton instance
export const walletService = new WalletService();