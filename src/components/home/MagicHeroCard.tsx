// components/MagicHeroCard.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface MagicHeroCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  isPending?: boolean;
}

const getAnimationStyles = (delay: number, isPending?: boolean) => ({
  opacity: 0,
  animation: isPending ? "none" : `fadeIn 0.5s ease-out ${delay}ms forwards`,
});

export const MagicHeroCard = ({
  children,
  className,
  delay = 0,
  isPending,
}: MagicHeroCardProps) => {
  const lightModeClasses = cn(
    "bg-white border border-gray-100 shadow-xl shadow-indigo-100/60 text-gray-900 hover:border-indigo-300 hover:shadow-indigo-200/80"
  );
  const darkModeClasses = cn(
    "dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:shadow-2xl dark:shadow-indigo-900/50 dark:hover:shadow-indigo-700/50"
  );

  return (
    <div
      className={cn(
        "relative p-8 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01]",
        lightModeClasses,
        darkModeClasses,
        className
      )}
      style={getAnimationStyles(delay, isPending)}
    >
      <div className="absolute inset-0 z-0 opacity-40 blur-xl pointer-events-none">
        <div
          className={cn(
            "absolute w-2/3 h-2/3 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-[magic-move_10s_linear_infinite] bg-gradient-to-r",
            "from-blue-200/50 to-indigo-200/50",
            "dark:from-indigo-500/70 dark:to-fuchsia-500/70"
          )}
          style={{ left: "50%", top: "50%" }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};
