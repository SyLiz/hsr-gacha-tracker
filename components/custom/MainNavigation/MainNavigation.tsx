"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface MainNavigationProps {
  isMobile?: boolean;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  isMobile = false,
}) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const menu = [
    { name: "Import Logs", path: "/tracker" },
    { name: "Character Banner", path: "/tracker/character" },
    { name: "Light Cone Banner", path: "/tracker/light-cone" },
    { name: "Standard Banner", path: "/tracker/standard" },
    { name: "Special Banners", path: "/tracker/special" },
  ];

  // Only show navigation for gacha tracker pages
  const isGachaPage = pathname.startsWith("/tracker");
  if (!isGachaPage) return null;

  // Mobile navigation using Sheet (left-side drawer)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <nav className="space-y-2">
              {menu.map((item) => (
                <SheetClose key={item.path} asChild>
                  <Link
                    href={item.path}
                    className={cn(
                      "flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200",
                      pathname === item.path
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop navigation - horizontal menu
  return (
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
  );
};
