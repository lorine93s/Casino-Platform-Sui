import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  hoverColor: "primary" | "secondary" | "accent" | "warning";
  className?: string;
}

export function FeatureCard({ icon, title, description, hoverColor, className }: FeatureCardProps) {
  const hoverBorderColors = {
    primary: "hover:border-primary/30",
    secondary: "hover:border-secondary/30",
    accent: "hover:border-accent/30",
    warning: "hover:border-warning/30"
  };

  const iconBgColors = {
    primary: "bg-primary/20",
    secondary: "bg-secondary/20",
    accent: "bg-accent/20",
    warning: "bg-warning/20"
  };

  const iconTextColors = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    warning: "text-warning"
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "glassmorphism rounded-xl p-6 border border-slate-700",
        hoverBorderColors[hoverColor],
        "transition-colors",
        className
      )}
    >
      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4", iconBgColors[hoverColor])}>
        <div className={cn("text-xl", iconTextColors[hoverColor])}>
          {icon}
        </div>
      </div>
      <h3 className="font-display font-semibold text-xl mb-2">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </motion.div>
  );
}
