import { MainLayout } from "@/layouts/main-layout";
import { HeroSection } from "@/components/hero-section";
import { GamesSection } from "@/components/games-section";
import { LeaderboardSection } from "@/components/leaderboard-section";
import { FeaturesSection } from "@/components/features-section";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <MainLayout title="Gaming Hub">
      <HeroSection />
      <GamesSection />
      <LeaderboardSection />
      <FeaturesSection />
      <CTASection />
    </MainLayout>
  );
}
