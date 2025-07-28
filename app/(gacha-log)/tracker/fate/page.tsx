"use client";
import React, { useEffect, useState } from "react";
import { SummarySector } from "@/components/custom";
import { DataTable } from "@/components/custom/LogTable/data-table";
import { columns } from "@/components/custom/LogTable/columns";
import { Log } from "@/models/GachaLog";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import ScrollMenuComponent, {
  RecentModel,
} from "@/components/custom/ScrollMenu/scrollmenu";
import { BannerType } from "@/lib/constant";
import { convertLogToGachaPull } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FilePlus, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { SettingButton } from "@/components/custom/SettingButton/SettingButton";

function TrackerFate() {
  const { logs } = useGachaLog();
  const [recentList, setRecentList] = useState<RecentModel[]>([]);
  const router = useRouter();

  function getWinData(original: Log[]) {
    var temp: RecentModel[] = [];

    const list = [...original]; // Keep original order (oldest to newest)
    var diffrent: number = 0;
    for (var i = 0; i < list.length; i++) {
      let character = list[i];
      diffrent = diffrent + 1;
      if (character.rank_type === "5") {
        // Use enhanced WIN/LOSE logic with banner matching
        const enhancedPull = convertLogToGachaPull(character);
        const isWin = enhancedPull.result === "WIN";
        temp.push({
          rolls: diffrent,
          isWin: isWin,
          data: character,
        });
        diffrent = 0;
      }
    }
    return temp.reverse(); // Show newest first
  }

  useEffect(() => {
    if (logs.fate) {
      setRecentList(getWinData(logs.fate));
    }
  }, [logs]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Fate Character Warp</CardTitle>
            <CardDescription>
              Analysis of your Fate Character Warp history.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="history">Warp History</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <div className="grid gap-4 mt-4">
              <SummarySector
                data={logs.fate}
                fiveStarList={recentList}
                bannerType={BannerType.Character}
              />
              <div className="mt-4 w-full">
                <ScrollMenuComponent
                  list={recentList}
                  title="Recent 5-Star Characters"
                  size="md"
                  maxItems={16}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <DataTable columns={columns} data={logs.fate} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TrackerFate;
