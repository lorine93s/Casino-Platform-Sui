import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import Games from "@/pages/games";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import History from "@/pages/history";
import AdminPage from "@/pages/admin";

// Game pages
import DiceGame from "@/pages/game/dice";
import SlotsGame from "@/pages/game/slots";
import CoinFlipGame from "@/pages/game/coinflip";
import CrashGame from "@/pages/game/crash";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games" component={Games} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/history" component={History} />
      <Route path="/admin" component={AdminPage} />
      
      {/* Game routes */}
      <Route path="/game/dice" component={DiceGame} />
      <Route path="/game/slots" component={SlotsGame} />
      <Route path="/game/coinflip" component={CoinFlipGame} />
      <Route path="/game/crash" component={CrashGame} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
