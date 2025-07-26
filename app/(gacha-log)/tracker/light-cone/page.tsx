"use client";
import React, { useState, useEffect } from "react";
import { SummarySector } from "@/components/custom";
import { DataTable } from "@/components/custom/LogTable/data-table";
import { columns } from "@/components/custom/LogTable/columns";
import { Log } from "@/models/GachaLog";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import ScrollMenuComponent, {
  RecentModel,
} from "@/components/custom/ScrollMenu/scrollmenu";
import { BannerType, standartLightCone } from "@/lib/constant";
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

function TrackerLightCone() {
  const { logs } = useGachaLog();
  const [recentList, setRecentList] = useState<RecentModel[]>([]);
  const router = useRouter();

  function getWinData(original: Log[]) {
    var temp: RecentModel[] = [];
    const list = [...original].reverse();
    var diffrent: number = 0;
    for (var i = 0; i < list.length; i++) {
      let lightCone = list[i];
      diffrent = diffrent + 1;
      if (lightCone.rank_type === "5") {
        const isWin = !standartLightCone.includes(
          lightCone.name.toLocaleLowerCase()
        );
        temp.push({
          rolls: diffrent,
          isWin: isWin,
          data: lightCone,
        });
        diffrent = 0;
      }
    }
    return [...temp].reverse();
  }

  useEffect(() => {
    if (logs.lightCone) {
      setRecentList(getWinData(logs.lightCone));
    }
  }, [logs]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Light Cone Event Warp</CardTitle>
            <CardDescription>
              Analysis of your Light Cone Event Warp history.
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
                data={logs.lightCone}
                fiveStarList={recentList}
                bannerType={BannerType.LightCone}
              />
              <div className="mt-4 w-full overflow-hidden">
                <h3 className="text-lg font-semibold mb-2 text-center">
                  Recent 5-Star Light Cones
                </h3>
                <div className="w-full max-w-full">
                  <ScrollMenuComponent list={recentList} />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <DataTable columns={columns} data={logs.lightCone} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TrackerLightCone;
