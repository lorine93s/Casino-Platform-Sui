import { FeatureCard } from "@/components/feature-card";
import { 
  Shield, 
  Bolt, 
  Lock, 
  Trophy, 
  Gauge, 
  UserCheck 
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-12 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl mb-4">Why Choose SUIPlay</h2>
          <p className="text-slate-300 max-w-xl mx-auto">Experience the next generation of blockchain gaming with unmatched transparency and instant payouts.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield />}
            title="Provably Fair"
            description="Every game result is verifiable on the SUI blockchain, ensuring complete transparency and fairness."
            hoverColor="primary"
          />
          
          <FeatureCard
            icon={<Bolt />}
            title="Instant Payouts"
            description="All winnings are instantly credited to your wallet without delays or manual processing."
            hoverColor="secondary"
          />
          
          <FeatureCard
            icon={<Lock />}
            title="Non-Custodial"
            description="We never hold your funds. Play directly from your connected SUI wallet with full control."
            hoverColor="accent"
          />
          
          <FeatureCard
            icon={<Trophy />}
            title="Huge Rewards"
            description="Competitive RTP rates and special jackpots give you more chances to win big on every game."
            hoverColor="warning"
          />
          
          <FeatureCard
            icon={<Gauge />}
            title="Fast & Efficient"
            description="Built on SUI's high-performance blockchain for lightning-fast game rounds and confirmations."
            hoverColor="primary"
          />
          
          <FeatureCard
            icon={<UserCheck />}
            title="Privacy Focused"
            description="Connect with your wallet address only - no personal information or KYC required to play."
            hoverColor="secondary"
          />
        </div>
      </div>
    </section>
  );
}
