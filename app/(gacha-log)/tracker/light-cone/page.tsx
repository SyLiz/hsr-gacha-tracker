"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  SummarySector,
  BannerCard,
  WarpHeader,
  AnalyticsCards,
} from "@/components/custom";
import { DataTable } from "@/components/custom/LogTable/data-table";
import { columns } from "@/components/custom/LogTable/columns";
import { Log } from "@/models/GachaLog";
import {
  useGachaLog,
  useGachaBanners,
  useGachaPulls,
} from "@/lib/Context/gacha-logs-provider";
import ScrollMenuComponent, {
  RecentModel,
} from "@/components/custom/ScrollMenu/scrollmenu";
import { BannerType } from "@/lib/constant";
import { convertLogToGachaPull, calculateBannerStats } from "@/lib/utils";
import { getLightConePortrait, getBannerDisplayColor } from "@/lib/assets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FilePlus,
  Settings,
  Trophy,
  Target,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SettingButton } from "@/components/custom/SettingButton/SettingButton";
import { motion } from "framer-motion";

function TrackerLightCone() {
  // This page handles ONLY Light Cone Event Warp (gacha_type "12") data
  // All filters and displays are specifically for GACHA_TYPE_MAPPINGS.LightCone
  const { logs } = useGachaLog();
  const { banners, bannerStats } = useGachaBanners();
  const { enhancedPulls } = useGachaPulls();
  const [recentList, setRecentList] = useState<RecentModel[]>([]);
  const [showEmptyBanners, setShowEmptyBanners] = useState(false); // Hide empty banners by default
  const router = useRouter();

  // Get light cone banners and their statistics - ONLY Light Cone Event Warp (12)
  const lightConeBanners = useMemo(() => {
    const filtered = banners.filter((banner) => banner.type === "12");

    // Sort by start date (newest first)
    const sorted = filtered.sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    if (showEmptyBanners) {
      return sorted;
    } else {
      // Only show banners that have statistics (meaning they have pulls)
      return sorted.filter((banner) => bannerStats[banner.gacha_id]);
    }
  }, [banners, bannerStats, showEmptyBanners]);

  // Get enhanced light cone pulls with WIN/LOSE data - ONLY Light Cone Event Warp (12)
  const lightConePulls = useMemo(() => {
    return enhancedPulls.filter((pull) => pull.gacha_type === "12");
  }, [enhancedPulls]);

  // Calculate enhanced win data with banner context
  const getEnhancedWinData = useCallback(
    (pulls = lightConePulls) => {
      var temp: RecentModel[] = [];
      const list = [...pulls]; // Keep original order (oldest to newest)
      var diffrent: number = 0;

      for (var i = 0; i < list.length; i++) {
        let pull = list[i];
        diffrent = diffrent + 1;

        if (pull.rank_type === "5") {
          // Use the enhanced WIN/LOSE logic instead of standard light cone check
          const isWin = pull.result === "WIN";
          temp.push({
            rolls: diffrent,
            isWin: isWin,
            data: pull, // Now includes banner context and result
          });
          diffrent = 0;
        }
      }
      // Reverse to show newest first (left) to oldest last (right)
      return temp.reverse();
    },
    [lightConePulls]
  );

  // Legacy getWinData for backward compatibility
  function getWinData(original: Log[]) {
    const enhancedPulls = original.map((log) => convertLogToGachaPull(log));
    return getEnhancedWinData(enhancedPulls);
  }

  // Calculate overall light cone stats
  const lightConeStats = useMemo(() => {
    return calculateBannerStats(lightConePulls);
  }, [lightConePulls]);

  // Update recent list when enhanced pulls change
  useEffect(() => {
    if (lightConePulls.length > 0) {
      setRecentList(getEnhancedWinData(lightConePulls));
    }
  }, [lightConePulls]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <WarpHeader
        title="Light Cone Event Warp"
        description="Analysis of your Light Cone Event Warp history with WIN/LOSE tracking. Only shows Light Cone Event Warp banners."
        icon={Zap}
        highlightValue={lightConeStats.currentPity}
        highlightLabel="Current Pity"
        highlightColor="text-blue-500"
        stats={[
          { value: lightConeStats.totalPulls, label: "Total Pulls" },
          {
            value: lightConeStats.fiveStarPulls,
            label: "5★ Light Cones",
            color: "text-yellow-500",
          },
          {
            value: `${lightConeStats.winRate.toFixed(1)}%`,
            label: "Win Rate",
            color: "text-green-500",
          },
          {
            value: Math.floor(lightConeStats.totalPulls / 160),
            label: "Total Jades",
          },
        ]}
      />

      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="history">Warp History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-4 mt-4">
            <SummarySector
              data={logs.lightCone}
              fiveStarList={recentList}
              bannerType={BannerType.LightCone}
            />
            <div className="mt-4 w-full">
              <ScrollMenuComponent
                list={recentList}
                title="Recent 5-Star Light Cones"
                size="md"
                maxItems={16}
                bannerType="12"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <DataTable columns={columns} data={logs.lightCone} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <AnalyticsCards
              cards={[
                {
                  title: "Pull Analysis",
                  icon: Target,
                  metrics: [
                    {
                      label: "Average Pity",
                      value: lightConeStats.averagePity.toFixed(1),
                    },
                    {
                      label: "Shortest Pity",
                      value:
                        recentList.length > 0
                          ? Math.min(...recentList.map((r) => r.rolls))
                          : "N/A",
                      color: "text-green-500",
                    },
                    {
                      label: "Longest Pity",
                      value:
                        recentList.length > 0
                          ? Math.max(...recentList.map((r) => r.rolls))
                          : "N/A",
                      color: "text-red-500",
                    },
                    {
                      label: "Total Jade Cost",
                      value: (
                        Math.floor(lightConeStats.totalPulls / 160) * 160
                      ).toLocaleString(),
                      color: "text-blue-500",
                    },
                  ],
                },
                {
                  title: "Win/Loss Breakdown",
                  icon: TrendingUp,
                  metrics: [
                    {
                      label: "Successful Pulls",
                      value: lightConeStats.winCount,
                      color: "text-green-500",
                    },
                    {
                      label: "Lost 50/50s",
                      value: lightConeStats.loseCount,
                      color: "text-red-500",
                    },
                    {
                      label: "4★ Rate",
                      value: `${(
                        (lightConeStats.fourStarPulls /
                          lightConeStats.totalPulls) *
                        100
                      ).toFixed(2)}%`,
                      color: "text-purple-500",
                    },
                    {
                      label: "5★ Rate",
                      value: `${(
                        (lightConeStats.fiveStarPulls /
                          lightConeStats.totalPulls) *
                        100
                      ).toFixed(2)}%`,
                      color: "text-yellow-500",
                    },
                  ],
                },
              ]}
            />

            {/* Banner Performance */}
            {lightConeBanners.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">
                      Banner Performance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Analyze your pulls across different light cone banners
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background/50 backdrop-blur-sm">
                      <span className="text-sm text-muted-foreground">
                        View:
                      </span>
                      <Button
                        variant={showEmptyBanners ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => setShowEmptyBanners(!showEmptyBanners)}
                        className="h-7 px-3 text-xs font-medium transition-all hover:shadow-sm"
                      >
                        {showEmptyBanners ? (
                          <>
                            <span>All Banners</span>
                            <Badge
                              variant="secondary"
                              className="ml-2 h-5 text-xs bg-muted text-muted-foreground"
                            >
                              {lightConeBanners.length}
                            </Badge>
                          </>
                        ) : (
                          <>
                            <span>With Data</span>
                            <Badge
                              variant="secondary"
                              className="ml-2 h-5 text-xs bg-primary/10 text-primary"
                            >
                              {
                                lightConeBanners.filter(
                                  (b) => bannerStats[b.gacha_id]
                                ).length
                              }
                            </Badge>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                {lightConeBanners.map((banner) => (
                  <BannerCard
                    key={banner.gacha_id}
                    banner={banner}
                    stats={bannerStats[banner.gacha_id]}
                    pulls={enhancedPulls}
                    bannerType="lightcone"
                  />
                ))}
              </div>
            )}

            {/* Show message when no banners are visible */}
            {lightConeBanners.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {banners.filter((banner) => banner.type === "12").length ===
                0 ? (
                  <>
                    <p className="text-lg mb-2">
                      No Light Cone Banner Configuration
                    </p>
                    <p className="text-sm">
                      Light Cone Event Warp banner configurations are not yet
                      available.
                      <br />
                      Only Character Event Warp banners are currently configured
                      in the system.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg mb-2">No Light Cone Banner Data</p>
                    <p className="text-sm">
                      No pull data found for Light Cone Event Warp banners.
                      <br />
                      Click &ldquo;Show All&rdquo; to see all configured
                      banners, including those without data.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TrackerLightCone;
