"use client";

import * as React from "react";
import IDock from "@/components/idok";
import Imenu from "@/components/Imenu";
import { cn } from "@/lib/utils";

export default function IHeader() {
  return (
    <>
      {/* Desktop Header - Sticky, Always Visible */}
      <header
        className={cn(
          "hidden md:flex z-50 w-full h-14 lg:h-16 px-4 lg:px-6 items-center justify-center", // justify-end → баруун талд
          "sticky top-0 rounded-2xl right-1 left-1",
          "bg-gradient-to-b from-background/98 to-background/95 backdrop-blur-md",
          "border-b border-gray-200/60 dark:border-gray-800/60 ",
          "shadow-sm hover:shadow-md transition-shadow duration-300"
        )}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center justify-center">
            <Imenu />
          </div>
        </div>
      </header>

      {/* Mobile Dock - Fixed at bottom */}
      <div
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-50",
          "bg-gradient-to-t from-background/98 to-background/95 backdrop-blur-md",
          "border-t border-gray-200/60 dark:border-gray-800/60",
          "px-4 py-3 safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
        )}
      >
        <IDock />
      </div>

      <div className="md:hidden h-16" aria-hidden="true" />
    </>
  );
}
