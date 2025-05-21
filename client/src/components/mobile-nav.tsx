import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  Home, 
  GamepadIcon, 
  Trophy, 
  User, 
  History, 
  Dice5,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/games", label: "Games", icon: GamepadIcon },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <nav className={cn("lg:hidden bg-slate-850 border-b border-slate-700 p-4 sticky top-0 z-30", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Dice5 className="text-accent mr-2 h-6 w-6" />
          <span className="font-display font-bold text-xl">SUIPlay</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMenu}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      
      {isOpen && (
        <div className="mt-4 glassmorphism rounded-lg p-4">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center p-2 rounded-lg hover:bg-slate-700 transition-colors",
                    isActive && "active-nav"
                  )}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
