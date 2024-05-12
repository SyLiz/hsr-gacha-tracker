"use client";

import { GachaLogProvider } from "@/lib/Context/gacha-logs-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface MenuType {
  name: string;
  path: string;
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menu: MenuType[] = [
    { name: "Character", path: "/tracker/character" },
    { name: "Light Cone", path: "/tracker/light-cone" },
    { name: "Standard", path: "/tracker/standard" },
  ];
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-screen">
        <div className="w-1/3 bg-gray-200 overflow-y-auto sticky top-0 h-screen">
          <div className="p-8">
            <Button
              variant="link"
              className={pathname === menu[0].path ? ` font-bold` : ""}
              onClick={() => {
                router.push(menu[0].path);
              }}
            >
              Character
            </Button>
          </div>
          <div className="p-8">
            <Button
              variant="link"
              className={pathname === menu[1].path ? ` font-bold` : ""}
              onClick={() => {
                router.push(menu[1].path);
              }}
            >
              Light Cone
            </Button>
          </div>
          <div className="p-8">
            <Button
              variant="link"
              className={pathname === menu[2].path ? ` font-bold` : ""}
              onClick={() => {
                router.push(menu[2].path);
              }}
            >
              Standard
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto h-screen bg-gray-100">
          <div className="flex flex-col flex-grow bg-blue-200 w-full max-w-[960px]">
            <GachaLogProvider>{children}</GachaLogProvider>{" "}
          </div>
        </div>
      </div>
    </>
  );
}
