// src/components/home/Dashboard.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  isPending?: boolean;
}

const getAnimationStyles = (delay: number, isPending?: boolean) => ({
  opacity: 0,
  animation: isPending ? "none" : `fadeIn 0.5s ease-out ${delay}ms forwards`,
});

export const DashboardCard = ({
  children,
  className,
  delay = 0,
  isPending,
}: DashboardCardProps) => (
  <div
    className={cn(
      "p-6 rounded-2xl transition-all duration-500 shadow-xl cursor-pointer",
      "hover:shadow-2xl hover:translate-y-[-4px]",
      "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 border border-gray-100 dark:border-gray-800 hover:shadow-indigo-300/50 dark:hover:shadow-indigo-700/50",
      className
    )}
    style={getAnimationStyles(delay, isPending)}
  >
    {children}
  </div>
);
