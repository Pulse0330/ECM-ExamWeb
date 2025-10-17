"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { Home, Package, Settings, User, LogOut } from "lucide-react";
import {
  Dock,
  DockItem,
  DockIcon,
  DockLabel,
} from "@/components/ui/shadcn-io/dock";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function IDock() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dockData = useMemo(
    () => [
      {
        title: "Home",
        icon: (
          <Home className="h-full w-full text-neutral-600 dark:text-neutral-300" />
        ),
        href: "/home",
      },
      {
        title: "Products",
        icon: (
          <Package className="h-full w-full text-neutral-600 dark:text-neutral-300" />
        ),
        href: "/iexam",
      },
      {
        title: "Settings",
        icon: (
          <Settings className="h-full w-full text-neutral-600 dark:text-neutral-300" />
        ),
        href: "/changelog",
      },
      {
        title: "User",
        icon: (
          <User className="h-full w-full text-neutral-600 dark:text-neutral-300" />
        ),
        href: "/user",
      },
      {
        title: "Theme",
        icon: (
          <div className="h-full w-full flex items-center justify-center">
            {mounted && <AnimatedThemeToggler />}
          </div>
        ),
      },
      {
        title: "LogOut",
        icon: (
          <LogOut className="h-full w-full text-neutral-600 dark:text-neutral-300" />
        ),
        href: "/LogOut",
      },
    ],
    [theme, mounted]
  );

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
      <Dock className="items-end pb-3">
        {dockData.map((item) => {
          const content = (
            <DockItem
              className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 transition hover:scale-105"
              {...("onClick" in item ? { onClick: item.onClick } : {})}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>{item.icon}</DockIcon>
            </DockItem>
          );

          return item.href ? (
            <Link href={item.href} key={item.title} aria-label={item.title}>
              {content}
            </Link>
          ) : (
            <div key={item.title}>{content}</div>
          );
        })}
      </Dock>
    </div>
  );
}
