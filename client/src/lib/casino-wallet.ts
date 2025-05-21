// Casino Wallet Implementation
// This handles the house funds and player losses

interface CasinoWalletState {
  balance: number;
  address: string;
  totalWagered: number;
  totalPaidOut: number;
  profitLoss: number;
}

class CasinoWallet {
  private state: CasinoWalletState;
  private listeners: Array<(state: CasinoWalletState) => void> = [];
  
  constructor() {
    // Initialize with default values
    this.state = {
      balance: 1000000, // 1 million SUI initial bank
      address: '0xCASINO_HOUSE_WALLET_ADDRESS',
      totalWagered: 0,
      totalPaidOut: 0,
      profitLoss: 0
    };
  }
  
  // Get current casino wallet state
  public getState(): CasinoWalletState {
    return { ...this.state };
  }
  
  // Process player bet (add to casino balance when player loses)
  public processBet(amount: number, isPlayerWin: boolean, winAmount: number): void {
    // Update total wagered
    this.state.totalWagered += amount;
    
    if (isPlayerWin) {
      // Player won, subtract from casino balance
      this.state.balance -= winAmount;
      this.state.totalPaidOut += winAmount;
      this.state.profitLoss -= winAmount - amount;
    } else {
      // Player lost, add to casino balance
      this.state.balance += amount;
      this.state.profitLoss += amount;
    }
    
    // Notify listeners
    this.notifyListeners();
  }
  
  // Register a listener for state changes
  public subscribe(listener: (state: CasinoWalletState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // Notify all listeners of state change
  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
  }
  
  // Get casino stats for display
  public getStats() {
    return {
      houseEdge: '2%',
      totalWagered: this.state.totalWagered,
      totalPaidOut: this.state.totalPaidOut,
      profitLoss: this.state.profitLoss,
      currentBalance: this.state.balance
    };
  }
}

// Export a singleton instance
export const casinoWallet = new CasinoWallet();
export default casinoWallet;