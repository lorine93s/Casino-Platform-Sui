import { useWallet } from "@/contexts/wallet-context";

// A simple hook to access wallet context
export default function useWalletHook() {
  return useWallet();
}
