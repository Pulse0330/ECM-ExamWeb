"use client";

import * as React from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

export default function Imenu() {
  return (
    <div className="flex items-center justify-between w-full">
      <NavigationMenu>
        <NavigationMenuList>
          {/* Үндсэн хуудас */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/home" className={navigationMenuTriggerStyle()}>
                Үндсэн хуудас
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Шалгалт */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Шалгалт</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[300px] gap-3 p-4">
                <ListItem href="/examlist" title="Шалгалт">
                  Бүртгэлтэй шалгалтуудын жагсаалт
                </ListItem>
                <ListItem href="/sorillist" title="Сорил">
                  Дасгал сорилуудын жагсаалт
                </ListItem>
                <ListItem href="/test" title="Тест">
                  Тестийн жагсаалт
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Хичээл */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Хичээл</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[300px] gap-3 p-4">
                <ListItem href="/lessons" title="Хичээлийн жагсаалт">
                  Бүх хичээлүүдийг үзэх
                </ListItem>
                <ListItem href="/courses" title="Курсууд">
                  Онлайн сургалтын курсууд
                </ListItem>
                <ListItem href="/materials" title="Материал">
                  Хичээлийн материалууд
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Хэрэглэгчийн мэдээлэл */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/user" className={navigationMenuTriggerStyle()}>
                Хэрэглэгчийн мэдээлэл
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Theme Toggle */}
      <div className="flex flex-initial ml-auto items-center">
        <AnimatedThemeToggler />
      </div>
    </div>
  );
}

function ListItem({
  className,
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & { href: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
