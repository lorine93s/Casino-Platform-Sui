import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  GamepadIcon, 
  Trophy, 
  User, 
  History, 
  Dice5, 
  ChevronsRight 
} from "lucide-react";

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/games", label: "Games", icon: GamepadIcon },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <aside className={cn("hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border", className)}>
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center">
          <Dice5 className="text-accent text-3xl mr-3" />
          <h1 className="font-display font-bold text-2xl text-sidebar-foreground">SUIPlay</h1>
        </div>
        <p className="text-sm text-sidebar-foreground/70 mt-2">Blockchain Casino on SUI</p>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center p-3 rounded-lg hover:bg-sidebar-accent/10 text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors",
                  isActive && "active-nav"
                )}
              >
                <Icon className="w-5 h-5 mr-2" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-sm text-sidebar-foreground/70 mb-2">Connected to SUI Network</div>
        <div className="flex items-center">
          <div className="h-2 w-2 bg-accent rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-sidebar-foreground/80">Mainnet</span>
        </div>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <a href="#" className="text-sm text-sidebar-foreground/60 hover:text-accent">Help</a>
          <a href="#" className="text-sm text-sidebar-foreground/60 hover:text-accent">Terms</a>
          <a href="#" className="text-sm text-sidebar-foreground/60 hover:text-accent">Privacy</a>
        </div>
      </div>
    </aside>
  );
}
