import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { LiveActivity } from "@/components/live-activity";
import { Play, Info, Shield, Bolt, Lock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background z-0"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <motion.h1 
              className="font-display font-bold text-4xl lg:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Play, Win & Earn<br/>on SUI Blockchain
            </motion.h1>
            <motion.p 
              className="text-slate-300 text-lg mb-8 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Experience the future of gaming with our provably fair blockchain casino. Connect your SUI wallet and start playing in seconds.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                asChild
                className="bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 h-auto shadow-xl shadow-accent/20"
              >
                <Link href="/games">
                  <Play className="mr-2 h-4 w-4" />
                  Start Playing
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-3 h-auto shadow-lg"
              >
                <Info className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </motion.div>
            <motion.div 
              className="flex flex-wrap mt-8 text-sm text-slate-400 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center">
                <Shield className="mr-2 text-accent h-4 w-4" />
                Provably Fair
              </div>
              <div className="flex items-center">
                <Bolt className="mr-2 text-accent h-4 w-4" />
                Instant Payouts
              </div>
              <div className="flex items-center">
                <Lock className="mr-2 text-accent h-4 w-4" />
                Secure
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="lg:w-1/2 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-secondary opacity-30 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary opacity-30 rounded-full filter blur-3xl"></div>
              <LiveActivity />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
