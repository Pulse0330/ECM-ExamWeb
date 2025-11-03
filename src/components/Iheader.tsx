"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import Imenu from "@/components/Imenu";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import ServerDate from "./serverdate";

export default function IHeader() {
  const router = useRouter();

  const handleLogout = () => {
    console.log("User logged out");
    router.push("/login");
  };

  return (
    <>
      <header
        className={cn(
          "hidden md:flex z-50 w-full h-14 lg:h-16 px-4 lg:px-6 items-center",
          "sticky top-0 rounded-2xl right-1 left-1",
          "bg-background/95 backdrop-blur-md",
          "border-b border-gray-200/60 dark:border-gray-800/60",
          "shadow-sm hover:shadow-md transition-shadow duration-300"
        )}
      >
        <div className="w-full max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="justify-self-start">
            <ServerDate />
          </div>

          <div className="justify-self-center">
            <Imenu />
          </div>

          <div className="flex items-center gap-3 justify-self-end">
            <AnimatedThemeToggler />

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm font-medium"
                >
                 Системээс гарах
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Системээс гарах</DialogTitle>
                  <DialogDescription>
                    Та системээс гарахдаа итгэлтэй байна уу?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost">
                      Цуцлах
                    </Button>
                  </DialogClose>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    Тийм, гарах
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
    </>
  );
}