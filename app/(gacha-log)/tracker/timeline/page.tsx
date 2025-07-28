"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import {
  convertLogToGachaPull,
  generateTimelineEvents,
  groupPullsByDate,
  formatPullTime,
} from "@/lib/utils";
import { getBannerDisplayColor } from "@/lib/assets";
import {
  getBannerByGachaId,
  getBannerForPullTime,
  CONFIGURED_BANNERS,
  getBannerTypeDisplay,
} from "@/lib/constant";
import { GachaPull, GachaBanner, TimelineEvent, Log } from "@/models/GachaLog";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Star,
  Calendar,
  TrendingUp,
  Trophy,
  Target,
  Sparkles,
  Filter,
  Clock,
} from "lucide-react";

interface TimelineData {
  date: string;
  pulls: number;
  fiveStars: number;
  fourStars: number;
  wins: number;
  losses: number;
  banner?: string;
  bannerType?: string;
}

interface BannerPeriod {
  banner: GachaBanner;
  start: Date;
  end: Date;
  pulls: GachaPull[];
  winRate: number;
}

const TimelinePage = () => {
  const { logs } = useGachaLog();
  const [selectedBannerTypes, setSelectedBannerTypes] = useState<string[]>([
    "11",
    "12",
    "1",
  ]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");
  const [showBannerPeriods, setShowBannerPeriods] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  // Convert logs to enhanced pull data
  const allPulls = useMemo(() => {
    const pulls: GachaPull[] = [];
    Object.entries(logs).forEach(([bannerType, logList]) => {
      logList.forEach((log: Log) => {
        pulls.push(convertLogToGachaPull(log));
      });
    });
    return pulls.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
  }, [logs]);

  // Filter pulls based on selected criteria
  const filteredPulls = useMemo(() => {
    let filtered = allPulls.filter((pull) => {
      if (pull.bannerContext) {
        return selectedBannerTypes.includes(pull.bannerContext.type);
      }
      return true;
    });

    // Apply time range filter
    if (selectedTimeRange !== "all") {
      const now = new Date();
      const daysAgo = parseInt(selectedTimeRange);
      const cutoffDate = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000
      );
      filtered = filtered.filter((pull) => new Date(pull.time) >= cutoffDate);
    }

    return filtered;
  }, [allPulls, selectedBannerTypes, selectedTimeRange]);

  // Generate timeline data for charts
  const timelineData = useMemo(() => {
    const dailyData: Record<string, TimelineData> = {};

    filteredPulls.forEach((pull) => {
      const date = pull.time.split(" ")[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          pulls: 0,
          fiveStars: 0,
          fourStars: 0,
          wins: 0,
          losses: 0,
          banner: pull.bannerContext?.name,
          bannerType: pull.bannerContext?.type,
        };
      }

      const data = dailyData[date];
      data.pulls++;

      if (pull.rank_type === "5") {
        data.fiveStars++;
        if (pull.result === "WIN") data.wins++;
        else data.losses++;
      } else if (pull.rank_type === "4") {
        data.fourStars++;
      }
    });

    return Object.values(dailyData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [filteredPulls]);

  // Calculate banner periods
  const bannerPeriods = useMemo(() => {
    return CONFIGURED_BANNERS.filter((banner) =>
      selectedBannerTypes.includes(banner.type)
    ).map((banner) => ({
      ...banner,
      color: getBannerDisplayColor(banner.type),
    }));
  }, [selectedBannerTypes]);

  // Trigger re-animation when filters change
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [selectedBannerTypes, selectedTimeRange, showBannerPeriods]);

  // Calculate statistics
  const stats = useMemo(() => {
    const fiveStarPulls = filteredPulls.filter((p) => p.rank_type === "5");
    const wins = fiveStarPulls.filter((p) => p.result === "WIN");
    const winRate =
      fiveStarPulls.length > 0 ? (wins.length / fiveStarPulls.length) * 100 : 0;

    return {
      totalPulls: filteredPulls.length,
      fiveStars: fiveStarPulls.length,
      winCount: wins.length,
      winRate,
    };
  }, [filteredPulls]);

  // Show "Coming Soon" in production
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Clock className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Timeline Feature</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This feature is coming soon! We&apos;re working hard to bring you an
          amazing timeline visualization of your gacha journey.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as TimelineData;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">
            {format(new Date(label), "MMM dd, yyyy")}
          </p>
          {data.banner && (
            <p className="text-sm text-muted-foreground mb-2">{data.banner}</p>
          )}
          <div className="space-y-1">
            <p className="text-sm">
              Total Pulls: <span className="font-medium">{data.pulls}</span>
            </p>
            {data.fiveStars > 0 && (
              <p className="text-sm text-yellow-500">
                5★ Pulls: <span className="font-medium">{data.fiveStars}</span>
              </p>
            )}
            {data.fourStars > 0 && (
              <p className="text-sm text-purple-500">
                4★ Pulls: <span className="font-medium">{data.fourStars}</span>
              </p>
            )}
            {data.wins > 0 && (
              <p className="text-sm text-green-500">
                Wins: <span className="font-medium">{data.wins}</span>
              </p>
            )}
            {data.losses > 0 && (
              <p className="text-sm text-red-500">
                Losses: <span className="font-medium">{data.losses}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const PullEvent = ({ pull, index }: { pull: GachaPull; index: number }) => {
    const isRare = pull.rank_type === "5" || pull.rank_type === "4";
    const isWin = pull.result === "WIN";

    return (
      <motion.div
        key={pull.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={`flex items-center space-x-3 p-3 rounded-lg border ${
          isRare
            ? "bg-gradient-to-r from-yellow-50 to-purple-50 border-yellow-200"
            : "bg-muted/50"
        }`}
      >
        <div
          className={`w-3 h-3 rounded-full ${
            pull.rank_type === "5"
              ? "bg-yellow-500"
              : pull.rank_type === "4"
              ? "bg-purple-500"
              : "bg-blue-500"
          }`}
        />

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{pull.name}</span>
            <Badge variant={isWin ? "default" : "secondary"}>
              {pull.result}
            </Badge>
            {isRare && (
              <div className="flex">
                {Array.from({ length: parseInt(pull.rank_type) }).map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    />
                  )
                )}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatPullTime(pull.time)} •{" "}
            {pull.bannerContext?.name || "Unknown Banner"}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">{pull.item_type}</div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Clock className="w-8 h-8 text-primary" />
              <span>Pull Timeline</span>
            </h1>
            <p className="text-muted-foreground">
              Visualize your gacha journey across time and banners
            </p>
          </div>

          <motion.div
            key={animationKey}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center space-x-4"
          >
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalPulls}</div>
              <div className="text-sm text-muted-foreground">Total Pulls</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-500">
                {stats.fiveStars}
              </div>
              <div className="text-sm text-muted-foreground">5★ Items</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-500">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center space-x-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm">Banner Types:</span>
                {["11", "12", "1"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={selectedBannerTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBannerTypes((prev) => [...prev, type]);
                        } else {
                          setSelectedBannerTypes((prev) =>
                            prev.filter((t) => t !== type)
                          );
                        }
                      }}
                    />
                    <label htmlFor={type} className="text-sm capitalize">
                      {getBannerTypeDisplay(type)}
                    </label>
                  </div>
                ))}
              </div>

              <Select
                value={selectedTimeRange}
                onValueChange={setSelectedTimeRange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="180">Last 6 Months</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="banner-periods"
                  checked={showBannerPeriods}
                  onCheckedChange={(checked) =>
                    setShowBannerPeriods(checked === true)
                  }
                />
                <label htmlFor="banner-periods" className="text-sm">
                  Show Banner Periods
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline-chart" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline-chart">Timeline Chart</TabsTrigger>
          <TabsTrigger value="banners">Banner Analysis</TabsTrigger>
          <TabsTrigger value="recent-pulls">Recent Activity</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline-chart">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Pull Activity Timeline</span>
              </CardTitle>
              <CardDescription>
                Daily pull activity with win/loss tracking across different
                banners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), "MMM dd")}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="pulls"
                      fill="#8884d8"
                      name="Total Pulls"
                      opacity={0.7}
                    />
                    <Line
                      type="monotone"
                      dataKey="fiveStars"
                      stroke="#ffc658"
                      strokeWidth={3}
                      name="5★ Pulls"
                      dot={{ fill: "#ffc658", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="wins"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Wins"
                      dot={{ fill: "#82ca9d", r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <div className="grid gap-4">
            {bannerPeriods.map((banner, index) => (
              <motion.div
                key={banner.gacha_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: banner.color,
                            }}
                          />
                          <span>{banner.name}</span>
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(banner.startDate), "MMM dd, yyyy")} -{" "}
                          {format(new Date(banner.endDate), "MMM dd, yyyy")}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={banner.type === "11" ? "default" : "secondary"}
                      >
                        {getBannerTypeDisplay(banner.type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {
                            banner.pickupItems.filter(
                              (item) => item.rarity === 5
                            ).length
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          5★ Items
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {
                            banner.pickupItems.filter(
                              (item) => item.rarity === 4
                            ).length
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          4★ Items
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent-pulls">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Recent Pull Activity</span>
              </CardTitle>
              <CardDescription>
                Your latest pulls with win/loss indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {filteredPulls
                    .slice(-20)
                    .reverse()
                    .map((pull, index) => (
                      <PullEvent key={pull.id} pull={pull} index={index} />
                    ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Success Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Overall Win Rate</span>
                    <span className="font-bold text-green-500">
                      {stats.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Wins</span>
                    <span className="font-bold text-green-500">
                      {stats.winCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>5★ Rate</span>
                    <span className="font-bold text-yellow-500">
                      {((stats.fiveStars / stats.totalPulls) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Banner Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["11", "12", "1"].map((type) => {
                    const typePulls = filteredPulls.filter(
                      (p) => p.bannerContext?.type === type
                    );
                    const typeFiveStars = typePulls.filter(
                      (p) => p.rank_type === "5"
                    );
                    const typeWins = typeFiveStars.filter(
                      (p) => p.result === "WIN"
                    );
                    const winRate =
                      typeFiveStars.length > 0
                        ? (typeWins.length / typeFiveStars.length) * 100
                        : 0;

                    return (
                      <div key={type} className="flex justify-between">
                        <span className="capitalize">
                          {getBannerTypeDisplay(type)}
                        </span>
                        <span className="font-bold">{winRate.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimelinePage;
