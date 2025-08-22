import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/custom/ThemeToggle/theme-toggle";

import "./globals.css";
import { SettingButton } from "@/components/custom/SettingButton/SettingButton";
import { GachaLogProvider } from "@/lib/Context/gacha-logs-provider";
import { MainNavigation } from "@/components/custom/MainNavigation/MainNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HSR Gacha Tracker",
  description:
    "Track your Honkai Star Rail gacha pulls and analyze your luck patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GachaLogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="sticky top-0 z-40 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {/* Mobile menu button only */}
                    <div className="md:hidden">
                      <MainNavigation isMobile />
                    </div>
                    <h1 className="text-2xl font-bold">HSR Gacha Tracker</h1>
                  </div>

                  <div className="flex gap-2">
                    <ThemeToggle />
                    <SettingButton />
                  </div>
                </div>
              </div>
            </header>
            <main>{children}</main>
            <Toaster />
          </ThemeProvider>
        </GachaLogProvider>
      </body>
    </html>
  );
}
