import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
}

export function formatBalance(balance: number | undefined): string {
  if (balance === undefined) return "0.00";
  return balance.toFixed(2);
}

export function formatCurrency(amount: number, currency = "SUI"): string {
  return `${formatBalance(amount)} ${currency}`;
}

export function timeAgo(date: Date | string | number): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (minutes > 0) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  return `${seconds} sec${seconds === 1 ? "" : "s"} ago`;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateClientSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function calculateResult(clientSeed: string, serverSeed: string, nonce: number, gameType: string): any {
  // Generate the combined seed
  const combinedSeed = `${clientSeed}-${serverSeed}-${nonce}`;
  const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
  
  switch (gameType) {
    case "dice":
      // Dice result is 0-100 based on first 8 characters of hash converted to decimal
      return {
        roll: parseInt(hash.slice(0, 8), 16) % 101
      };
    
    case "coinflip":
      // Coin flip result is 0 (tails) or 1 (heads) based on first character of hash
      return {
        side: parseInt(hash.slice(0, 1), 16) % 2 === 0 ? "tails" : "heads"
      };
    
    case "slots":
      // Slots result is an array of 3 numbers 0-9 based on different parts of the hash
      const slot1 = parseInt(hash.slice(0, 2), 16) % 10;
      const slot2 = parseInt(hash.slice(2, 4), 16) % 10;
      const slot3 = parseInt(hash.slice(4, 6), 16) % 10;
      return {
        reels: [slot1, slot2, slot3]
      };
    
    case "crash":
      // Crash result is a multiplier based on the hash
      // Using a simple algorithm for demo: 
      // 1 + (first 13 hex digits converted to float between 0 and 1) / 0.04
      const hexValue = hash.slice(0, 13);
      const decimalValue = parseInt(hexValue, 16) / 0xfffffffffffff;
      
      // If decimalValue < 0.04, the game will crash at 1x
      const crashPoint = decimalValue < 0.04 ? 1 : 
        Math.floor((100 * (1 / (1 - decimalValue / 25))) / 100);
      
      return {
        crashPoint
      };
    
    default:
      throw new Error("Invalid game type");
  }
}
