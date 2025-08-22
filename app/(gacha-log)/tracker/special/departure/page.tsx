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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Target, TrendingUp, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function DepartureWarpPage() {
  const { logs } = useGachaLog();
  const { banners, bannerStats } = useGachaBanners();
  const { enhancedPulls } = useGachaPulls();
  const [recentList, setRecentList] = useState<RecentModel[]>([]);
  const [showEmptyBanners, setShowEmptyBanners] = useState(false);
  const router = useRouter();
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  // Filter for Departure Warp data - we need to check if any logs exist for gacha_type "2"
  // Since departure warp data might be mixed in with other logs, we need to filter by gacha_type
  const departureWarpData = useMemo(() => {
    // Check all log types for gacha_type "2" pulls
    const allLogs = [
      ...logs.character,
      ...logs.lightCone,
      ...logs.standard,
      ...logs.fate,
    ];
    return allLogs.filter((log) => log.gacha_type === "2");
  }, [logs]);

  // Get departure warp banners and their statistics - ONLY gacha_type "2"
  const departureWarpBanners = useMemo(() => {
    const filtered = banners.filter((banner) => banner.type === "2");

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

  // Get enhanced departure warp pulls with WIN/LOSE data - ONLY gacha_type "2"
  const departureWarpPulls = useMemo(() => {
    return enhancedPulls.filter((pull) => pull.gacha_type === "2");
  }, [enhancedPulls]);

  // Calculate enhanced win data with banner context
  const getEnhancedWinData = useCallback(
    (pulls = departureWarpPulls) => {
      var temp: RecentModel[] = [];
      // Sort by ID to ensure chronological order (oldest first)
      // Smaller ID = older pull, larger ID = newer pull
      const sortedPulls = [...pulls].sort(
        (a, b) => parseInt(a.id) - parseInt(b.id)
      );

      // Find 5-star pulls and calculate correct pity for each
      const fiveStarPulls = sortedPulls.filter(
        (pull) => pull.rank_type === "5"
      );

      fiveStarPulls.forEach((fiveStar, index) => {
        let pityCount: number;

        if (index === 0) {
          // First 5-star: count from beginning
          const fiveStarIndex = sortedPulls.findIndex(
            (pull) => pull.id === fiveStar.id
          );
          pityCount = fiveStarIndex + 1;
        } else {
          // Subsequent 5-stars: count from previous 5-star
          const prevFiveStar = fiveStarPulls[index - 1];
          const prevFiveStarIndex = sortedPulls.findIndex(
            (pull) => pull.id === prevFiveStar.id
          );
          const currentFiveStarIndex = sortedPulls.findIndex(
            (pull) => pull.id === fiveStar.id
          );
          pityCount = currentFiveStarIndex - prevFiveStarIndex - 1;
        }

        // Use the enhanced WIN/LOSE logic
        const isWin = fiveStar.result === "WIN";
        temp.push({
          rolls: pityCount,
          isWin: isWin,
          data: fiveStar, // Now includes banner context and result
        });
      });

      // Reverse to show newest first (left) to oldest last (right)
      return temp.reverse();
    },
    [departureWarpPulls]
  );

  // Legacy getWinData for backward compatibility
  const getWinData = useCallback(
    (original: Log[]) => {
      const enhancedPulls = original.map((log) => convertLogToGachaPull(log));
      return getEnhancedWinData(enhancedPulls);
    },
    [getEnhancedWinData]
  );

  // Calculate overall departure warp stats
  const departureWarpStats = useMemo(() => {
    return calculateBannerStats(departureWarpPulls);
  }, [departureWarpPulls]);

  // Update recent list when enhanced pulls change
  useEffect(() => {
    if (departureWarpPulls.length > 0) {
      setRecentList(getEnhancedWinData(departureWarpPulls));
    } else if (departureWarpData.length > 0) {
      setRecentList(getWinData(departureWarpData));
    }
  }, [departureWarpPulls, departureWarpData, getEnhancedWinData, getWinData]);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/tracker/special")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Special Banners
      </Button>

      {/* Enhanced Header with Stats - Modified for Departure Warp */}
      <WarpHeader
        title="Departure Warp"
        description="Analysis of your Departure Warp history. Beginner-friendly banner with reduced pity system (50 pulls max)."
        icon={Gift}
        highlightValue={departureWarpStats.currentPity}
        highlightLabel="Current Pity"
        highlightColor="text-blue-500"
        stats={[
          { value: departureWarpStats.totalPulls, label: "Total Pulls" },
          {
            value: departureWarpStats.fiveStarPulls,
            label: "5★ Items",
            color: "text-yellow-500",
          },
          {
            value: `${departureWarpStats.winRate.toFixed(1)}%`,
            label: "Success Rate",
            color: "text-green-500",
          },
          {
            value: `${departureWarpStats.winCount}/${departureWarpStats.fiveStarPulls}`,
            label: "Success/Total",
            color: "text-blue-500",
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
              data={departureWarpData}
              fiveStarList={recentList}
              bannerType={BannerType.Character} // Departure warps are primarily character focused
            />
            <div className="mt-4 w-full">
              <ScrollMenuComponent
                list={recentList}
                title="Recent 5-Star Items"
                size="md"
                maxItems={16}
                bannerType="2"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <DataTable columns={columns} data={departureWarpData} />
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
                      value: departureWarpStats.averagePity.toFixed(1),
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
                      label: "Max Pity Limit",
                      value: "50",
                      color: "text-blue-500",
                    },
                    {
                      label: "Pulls Remaining",
                      value: Math.max(0, 50 - departureWarpStats.currentPity),
                      color:
                        departureWarpStats.currentPity >= 40
                          ? "text-red-500"
                          : "text-blue-500",
                    },
                  ],
                },
                {
                  title: "Departure Warp Stats",
                  icon: TrendingUp,
                  metrics: [
                    {
                      label: "5★ Obtained",
                      value: departureWarpStats.fiveStarPulls,
                      color: "text-yellow-500",
                    },
                    {
                      label: "4★ Obtained",
                      value: departureWarpStats.fourStarPulls,
                      color: "text-purple-500",
                    },
                    {
                      label: "5★ Rate",
                      value: `${(
                        (departureWarpStats.fiveStarPulls /
                          Math.max(1, departureWarpStats.totalPulls)) *
                        100
                      ).toFixed(2)}%`,
                      color: "text-yellow-500",
                    },
                    {
                      label: "Banner Status",
                      value:
                        departureWarpStats.totalPulls >= 50
                          ? "Complete"
                          : "Active",
                      color:
                        departureWarpStats.totalPulls >= 50
                          ? "text-green-500"
                          : "text-blue-500",
                    },
                  ],
                },
              ]}
            />

            {/* Banner Performance */}
            {departureWarpBanners.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">
                      Banner Performance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Analyze your pulls across departure warp banners
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
                              {departureWarpBanners.length}
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
                                departureWarpBanners.filter(
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
                {departureWarpBanners.map((banner) => (
                  <BannerCard
                    key={banner.gacha_id}
                    banner={banner}
                    stats={bannerStats[banner.gacha_id]}
                    pulls={enhancedPulls}
                    bannerType="departure"
                  />
                ))}
              </div>
            )}

            {/* Show message when no banners or data */}
            {departureWarpBanners.length === 0 &&
              departureWarpData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Gift className="h-16 w-16 mx-auto opacity-50" />
                    <div>
                      <p className="text-lg mb-2">No Departure Warp Data</p>
                      <p className="text-sm">
                        No pull data found for Departure Warp banners.
                        <br />
                        This banner is typically available for new accounts
                        only.
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DepartureWarpPage;
