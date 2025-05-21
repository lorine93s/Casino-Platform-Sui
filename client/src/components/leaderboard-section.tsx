import { useQuery } from "@tanstack/react-query";
import { Leaderboard } from "@/components/leaderboard";
import { LiveWins } from "@/components/live-wins";

export function LeaderboardSection() {
  return (
    <section className="py-12 px-4 bg-slate-850">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <Leaderboard />
          
          {/* Recent Wins */}
          <LiveWins />
        </div>
      </div>
    </section>
  );
}
