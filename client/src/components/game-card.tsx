import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { GameType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GameCardProps {
  gameType: GameType;
  title: string;
  description: string;
  minBet: number;
  maxWin: string;
  tags: {
    text: string;
    variant: "default" | "primary" | "secondary" | "accent" | "warning" | "destructive";
  }[];
  icon: React.ReactNode;
  className?: string;
}

export function GameCard({
  gameType,
  title,
  description,
  minBet,
  maxWin,
  tags,
  icon,
  className,
}: GameCardProps) {
  // Style classes based on game type
  const gradientClasses = {
    slots: "from-primary/30 to-secondary/30",
    dice: "from-secondary/30 to-primary/30",
    coinflip: "from-accent/30 to-primary/30",
    crash: "from-secondary/30 to-accent/30",
  };

  const getBadgeVariant = (variant: string) => {
    switch (variant) {
      case "primary":
        return "bg-primary/20 text-primary";
      case "secondary":
        return "bg-secondary/20 text-secondary";
      case "accent":
        return "bg-accent/20 text-accent";
      case "warning":
        return "bg-warning/20 text-warning";
      case "destructive":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  return (
    <motion.div
      className={cn(
        "game-card group relative overflow-hidden rounded-xl border border-slate-700 shadow-lg hover:shadow-accent/20 transition-all duration-300",
        className
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-800">
        <div
          className={cn(
            "game-image transition-transform duration-300 h-full bg-gradient-to-br flex flex-col items-center justify-center",
            gradientClasses[gameType]
          )}
        >
          <div className="text-5xl mb-4 text-white/90">{icon}</div>
          <div className="text-center">
            <h3 className="font-display font-semibold text-xl">{title}</h3>
            <p className="text-slate-300 text-sm">{description}</p>
          </div>
        </div>
        <div className="game-overlay absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent flex items-end opacity-0 transition-opacity duration-300">
          <div className="p-4 w-full">
            <div className="flex gap-2 mb-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  className={cn("text-xs px-2 py-1 rounded-full", getBadgeVariant(tag.variant))}
                >
                  {tag.text}
                </Badge>
              ))}
            </div>
            <Button
              asChild
              className="w-full bg-accent hover:bg-accent/90 text-white font-medium"
            >
              <Link href={`/game/${gameType}`}>Play Now</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4 bg-slate-800">
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-300">
            <span className="font-medium">Min Bet:</span> {minBet} SUI
          </div>
          <div className="text-sm text-slate-300">
            <span className="font-medium">Max Win:</span> {maxWin}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
