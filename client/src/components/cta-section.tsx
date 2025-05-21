import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Dice5, Wallet, HelpCircle } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";

export function CTASection() {
  const { connect, isConnected } = useWallet();

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 z-0"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="glassmorphism rounded-xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <h2 className="font-display font-bold text-3xl mb-4">Ready to Play?</h2>
              <p className="text-slate-300 mb-6">Connect your SUI wallet and start playing in seconds. No registration required.</p>
              <div className="flex flex-wrap gap-4">
                {!isConnected && (
                  <Button 
                    onClick={connect}
                    className="bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 h-auto shadow-xl shadow-accent/20"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                )}
                {isConnected && (
                  <Button
                    asChild
                    className="bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 h-auto shadow-xl shadow-accent/20"
                  >
                    <Link href="/games">Start Playing</Link>
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 h-auto shadow-lg border border-slate-600"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  How It Works
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent opacity-30 rounded-full filter blur-2xl"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary opacity-30 rounded-full filter blur-2xl"></div>
                <div className="relative flex items-center justify-center h-32 w-32 bg-slate-800 rounded-full border-4 border-slate-700">
                  <Dice5 className="text-slate-50 text-5xl h-16 w-16" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
