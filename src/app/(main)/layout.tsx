import FixedScrollButton from "@/components/FixedScrollButton";
import IHeader from "@/components/Iheader";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 bg-slate-50 dark:bg-gray-950">
        <IHeader />
      </div>
      <main>
        <FixedScrollButton/>
          {children}</main>
    </div>
  );
}
