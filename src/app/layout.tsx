// src/app/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/queryClient";
import { Toaster } from "sonner";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <body>
        {mounted ? (
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <QueryClientProvider client={queryClient}>
              <div className="container mx-auto">{children}</div>
              <Toaster position="top-right" richColors />
            </QueryClientProvider>
          </ThemeProvider>
        ) : (
          <div />
        )}
      </body>
    </html>
  );
}
