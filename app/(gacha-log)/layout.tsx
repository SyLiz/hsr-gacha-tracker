"use client";

import { GachaLogProvider } from "@/lib/Context/gacha-logs-provider";
import { MainNavigation } from "@/components/custom/MainNavigation/MainNavigation";

export default function GachaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Desktop navigation - separate from header */}
      <div className="hidden md:block mb-6">
        <MainNavigation />
      </div>

      {children}
    </div>
  );
}
