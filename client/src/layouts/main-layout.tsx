import { ReactNode } from "react";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { WalletButton } from "@/components/wallet-button";
import { ConnectedWallet } from "@/components/connected-wallet";
import { useWallet } from "@/contexts/wallet-context";
import { Footer } from "@/components/footer";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const { isConnected } = useWallet();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Mobile navbar */}
      <MobileNav />

      {/* Desktop Sidebar */}
      <MainNav />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top header with wallet */}
        <header className="border-b border-slate-700 p-4 flex justify-between items-center bg-slate-850 lg:sticky lg:top-0 z-20">
          <div className="lg:flex lg:items-center lg:space-x-4 hidden">
            <h2 className="font-display font-semibold text-xl">{title || "Gaming Hub"}</h2>
            <div className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-300">Live</div>
          </div>
          
          {/* Connect Wallet Button or Connected Wallet */}
          <WalletButton className="ml-auto" />
          <ConnectedWallet className="ml-auto" />
        </header>

        {/* Page Content */}
        {children}

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
