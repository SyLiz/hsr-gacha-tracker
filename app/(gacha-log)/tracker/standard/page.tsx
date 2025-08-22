"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { SummarySector } from "@/components/custom";
import { DataTable } from "@/components/custom/LogTable/data-table";
import { columns } from "@/components/custom/LogTable/columns";
import { useGachaLog, useGachaPulls } from "@/lib/Context/gacha-logs-provider";
import ScrollMenuComponent, {
  RecentModel,
} from "@/components/custom/ScrollMenu/scrollmenu";
import { BannerType } from "@/lib/constant";
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

function TrackerStandard() {
  const { logs } = useGachaLog();
  const { enhancedPulls } = useGachaPulls();
  const [recentStandardList, setRecentStandardList] = useState<RecentModel[]>(
    []
  );
  const router = useRouter();

  // Get enhanced standard banner pulls (gacha_type "1")
  const standardPulls = useMemo(() => {
    return enhancedPulls.filter((pull) => pull.gacha_type === "1");
  }, [enhancedPulls]);

  // Calculate enhanced win data for ALL standard banner items (combined pity)
  const getEnhancedStandardWinData = useCallback(
    (pulls = standardPulls) => {
      var temp: RecentModel[] = [];
      const list = [...pulls]; // Keep original order (oldest to newest)
      var diffrent: number = 0;

      for (var i = 0; i < list.length; i++) {
        let pull = list[i];
        diffrent = diffrent + 1;

        if (pull.rank_type === "5") {
          // For standard banner, all 5-stars are "LOSE" since there's no rate-up
          temp.push({
            rolls: diffrent,
            isWin: false, // Standard banner has no rate-up
            data: pull,
          });
          diffrent = 0;
        }
      }
      // Reverse to show newest first (left) to oldest last (right)
      return temp.reverse();
    },
    [standardPulls]
  );

  // Update recent list when enhanced pulls change
  useEffect(() => {
    if (standardPulls.length > 0) {
      setRecentStandardList(getEnhancedStandardWinData(standardPulls));
    }
  }, [standardPulls, getEnhancedStandardWinData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Stellar Warp</CardTitle>
            <CardDescription>
              Analysis of your Stellar Warp history.
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
                data={logs.standard}
                bannerType={BannerType.Standard}
              />

              {/* Recent 5-Star Items */}
              {recentStandardList.length > 0 && (
                <div className="mt-4 w-full">
                  <ScrollMenuComponent
                    list={recentStandardList}
                    title="Recent 5-Star Items"
                    size="md"
                    maxItems={16}
                    bannerType="1"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="history">
            <DataTable columns={columns} data={logs.standard} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TrackerStandard;
