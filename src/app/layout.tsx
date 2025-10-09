"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./globals.css";
import IDock from "@/components/idok";

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
        <IDock></IDock>
      </body>
    </html>
  );
}
