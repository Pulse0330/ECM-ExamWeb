"use client";

import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { MagicCard } from "./ui/magic-card";
import { NeonGradientCard } from "./ui/neon-gradient-card";

export function IMagicCard({ children }: { children: ReactNode }) {
  const { theme, systemTheme } = useTheme();

  // Resolve the actual theme being used
  const currentTheme = theme === "system" ? systemTheme : theme;
  const gradientColor = currentTheme === "dark" ? "#262626" : "#D9D9D955";

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md group">
        <NeonGradientCard className="w-full shadow-2xl rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
          <Card className="border-none p-0 shadow-none">
            <MagicCard
              gradientColor={gradientColor}
              className="p-4 transition-all duration-300 group-hover:scale-[1.02]"
            >
              {children}
            </MagicCard>
          </Card>
        </NeonGradientCard>
      </div>
    </div>
  );
}
