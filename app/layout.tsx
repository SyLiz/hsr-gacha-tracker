import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/custom/ThemeToggle/theme-toggle";

import "./globals.css";
import { SettingButton } from "@/components/custom/SettingButton/SettingButton";
import { GachaLogProvider } from "@/lib/Context/gacha-logs-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HSR Gacha Tracker",
  //description: "HSR Gacha Tracker",
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
            <header className="py-4 border-b ">
              <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">HSR Gacha Tracker</h1>
                <div className="flex gap-2">
                  <ThemeToggle />
                  <SettingButton />
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
