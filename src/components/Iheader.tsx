"use client";

import Link from "next/link";
import Image from "next/image";

export default function IHeader() {
  return (
    <header className="h-[7vh] shadow-md w-full px-6 flex items-center justify-between rounded-b-xl border border-border">
      <Link href="/home" className="flex items-center space-x-2">
        <Image
          src="/images/ECM%20LOGO.png"
          alt="ECM company logo"
          width={60}
          height={40}
          className="object-contain"
        />
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
          ECM GROUP
        </span>
      </Link>
    </header>
  );
}
