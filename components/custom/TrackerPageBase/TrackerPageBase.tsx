import React from "react";
import {
  SummarySector,
  BannerCard,
  WarpHeader,
  AnalyticsCards,
} from "@/components/custom";
import { DataTable } from "@/components/custom/LogTable/data-table";
import { columns } from "@/components/custom/LogTable/columns";
import {
  useTrackerLogic,
  TrackerLogicConfig,
} from "@/lib/hooks/useTrackerLogic";
import ScrollMenuComponent from "@/components/custom/ScrollMenu/scrollmenu";
import { BannerType } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface TrackerPageConfig {
  // Page metadata
  title: string;
  description: string;
  icon: LucideIcon;

  // Header configuration
  highlightColor: string;
  currentPityLabel?: string;

  // Stats configuration
  itemLabel: string; // e.g., "5★ Characters", "5★ Light Cones"
  scrollMenuTitle: string; // e.g., "Recent 5-Star Characters"
  bannerAnalysisTitle: string; // e.g., "Analyze your pulls across different character banners"
  bannerType: "character" | "lightcone";
  bannerTypeEnum: BannerType;

  // Analytics customization
  showJadeCost?: boolean;
  customMetricLabel?: string; // e.g., "Collaboration Items" for fate banners
  customMetricColor?: string;
  analyticsTitle2?: string; // e.g., "Fate Character Stats"

  // Navigation
  backRoute?: string;
  backLabel?: string;

  // Empty state
  emptyStateTitle: string;
  emptyStateDescription: string;
  emptyStateIcon?: LucideIcon;

  // Special handling
  isCollaboration?: boolean;
}

interface TrackerPageBaseProps {
  config: TrackerPageConfig;
  logicConfig: TrackerLogicConfig;
}

export function TrackerPageBase({ config, logicConfig }: TrackerPageBaseProps) {
  const {
    banners,
    logData,
    recentList,
    stats,
    bannerStats,
    enhancedPulls,
    showEmptyBanners,
    setShowEmptyBanners,
  } = useTrackerLogic(logicConfig);

  const router = useRouter();
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  const EmptyIcon = config.emptyStateIcon || config.icon;

  return (
    <div className="space-y-6">
      {/* Back Button (optional) */}
      {config.backRoute && (
        <Button
          variant="ghost"
          onClick={() => router.push(config.backRoute!)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {config.backLabel || "Back"}
        </Button>
      )}

      {/* Enhanced Header with Stats */}
      <WarpHeader
        title={config.title}
        description={config.description}
        icon={config.icon}
        highlightValue={stats.currentPity}
        highlightLabel={config.currentPityLabel || "Current Pity"}
        highlightColor={config.highlightColor}
        stats={[
          { value: stats.totalPulls, label: "Total Pulls" },
          {
            value: stats.fiveStarPulls,
            label: config.itemLabel,
            color: "text-yellow-500",
          },
          {
            value: `${stats.winRate.toFixed(1)}%`,
            label: "Win Rate",
            color: "text-green-500",
          },
          {
            value: `${stats.winCount}/${stats.fiveStarPulls}`,
            label: "Success/Total",
            color: config.highlightColor.replace("text-", "text-"),
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
              data={logData}
              fiveStarList={recentList}
              bannerType={config.bannerTypeEnum}
            />
            <div className="mt-4 w-full">
              <ScrollMenuComponent
                list={recentList}
                title={config.scrollMenuTitle}
                size="md"
                maxItems={16}
                bannerType={logicConfig.gachaType}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <DataTable columns={columns} data={logData} />
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
                      value: stats.averagePity.toFixed(1),
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
                      label: config.showJadeCost
                        ? "Total Jade Cost"
                        : config.customMetricLabel || "Total Items",
                      value: config.showJadeCost
                        ? formatter.format(stats.totalPulls * 160)
                        : stats.fiveStarPulls,
                      color: config.customMetricColor || "text-blue-500",
                    },
                  ],
                },
                {
                  title: config.analyticsTitle2 || "Win/Loss Breakdown",
                  icon: TrendingUp,
                  metrics: [
                    {
                      label: "Successful Pulls",
                      value: stats.winCount,
                      color: "text-green-500",
                    },
                    {
                      label: "Lost 50/50s",
                      value: stats.loseCount,
                      color: "text-red-500",
                    },
                    {
                      label: "4★ Rate",
                      value: `${(
                        (stats.fourStarPulls / Math.max(1, stats.totalPulls)) *
                        100
                      ).toFixed(2)}%`,
                      color: "text-purple-500",
                    },
                    {
                      label: "5★ Rate",
                      value: `${(
                        (stats.fiveStarPulls / Math.max(1, stats.totalPulls)) *
                        100
                      ).toFixed(2)}%`,
                      color: "text-yellow-500",
                    },
                  ],
                },
              ]}
            />

            {/* Banner Performance */}
            {banners.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">
                      Banner Performance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {config.bannerAnalysisTitle}
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
                              {banners.length}
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
                                banners.filter((b) => bannerStats[b.gacha_id])
                                  .length
                              }
                            </Badge>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                {banners.map((banner) => (
                  <BannerCard
                    key={banner.gacha_id}
                    banner={banner}
                    stats={bannerStats[banner.gacha_id]}
                    pulls={enhancedPulls}
                    bannerType={config.bannerType}
                  />
                ))}
              </div>
            )}

            {/* Show message when no banners or data */}
            {banners.length === 0 && logData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <EmptyIcon className="h-16 w-16 mx-auto opacity-50" />
                  <div>
                    <p className="text-lg mb-2">{config.emptyStateTitle}</p>
                    <p className="text-sm">
                      {config.emptyStateDescription}
                      {config.isCollaboration && (
                        <>
                          <br />
                          These are special limited-time collaboration banners.
                        </>
                      )}
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
