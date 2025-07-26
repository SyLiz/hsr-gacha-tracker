"use client";

import { GachaLogProvider } from "@/lib/Context/gacha-logs-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/custom/ThemeToggle/theme-toggle";
import { SettingButton } from "@/components/custom/SettingButton/SettingButton";

export default function GachaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menu = [
    { name: "Import Logs", path: "/tracker" },
    { name: "Character Banner", path: "/tracker/character" },
    { name: "Light Cone Banner", path: "/tracker/light-cone" },
    { name: "Standard Banner", path: "/tracker/standard" },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex justify-between items-center">
        <NavigationMenu>
          <NavigationMenuList>
            {menu.map((item) => (
              <NavigationMenuItem key={item.path}>
                <Link href={item.path} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === item.path
                        ? "bg-accent text-accent-foreground"
                        : ""
                    )}
                  >
                    {item.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}
