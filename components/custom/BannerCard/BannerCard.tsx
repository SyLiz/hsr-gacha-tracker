"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { BannerStats, GachaBanner, GachaPull } from "@/models/GachaLog";
import { getBannerDisplayColor } from "@/lib/assets";
import { getCharacterIcon, getLightConePortrait } from "@/lib/assets";
import { isBannerActive } from "@/lib/constant";

interface BannerCardProps {
  banner: GachaBanner;
  stats?: BannerStats;
  pulls: GachaPull[]; // All pulls of the same gacha_type for pity calculation
  bannerType: "character" | "lightcone" | "departure";
}

export const BannerCard: React.FC<BannerCardProps> = ({
  banner,
  stats,
  pulls,
  bannerType,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get 5★ pulls for this specific banner during its duration
  const bannerFiveStarPulls = useMemo(() => {
    const bannerStart = new Date(banner.startDate);
    const bannerEnd = new Date(banner.endDate);

    // Get all pulls of the same gacha_type, sorted by ID (oldest first)
    const allTypePulls = pulls
      .filter((pull) => pull.gacha_type === banner.type)
      .sort((a, b) => parseInt(a.id) - parseInt(b.id));

    // Find 5-star pulls that happened during this banner
    const bannerFiveStars = allTypePulls.filter((pull) => {
      const pullDate = new Date(pull.time);
      return (
        pull.rank_type === "5" &&
        pullDate >= bannerStart &&
        pullDate <= bannerEnd &&
        pull.gacha_id === banner.gacha_id
      );
    });

    // Calculate roll counts with proper pity carryover
    const pullsWithRolls: Array<{
      pull: GachaPull;
      rolls: number;
      isWin: boolean;
      rollsDuringBanner: number;
    }> = [];

    // For each 5-star in this banner, calculate its pity
    bannerFiveStars.forEach((fiveStar) => {
      // Find all 5-star pulls in chronological order up to this one
      const allFiveStarsUpToThis = allTypePulls.filter((pull) => {
        const pullTime = new Date(pull.time);
        const fiveStarTime = new Date(fiveStar.time);
        return pull.rank_type === "5" && pullTime <= fiveStarTime;
      });

      // Find the previous 5-star (if any)
      const fiveStarIndex = allFiveStarsUpToThis.length - 1; // Current 5-star index
      const prevFiveStarIndex = fiveStarIndex - 1; // Previous 5-star index

      let pityCount: number;
      if (prevFiveStarIndex < 0) {
        // First 5-star: count from beginning to this 5-star
        const currentIndex = allTypePulls.findIndex(
          (pull) => pull.id === fiveStar.id
        );
        pityCount = currentIndex + 1;
      } else {
        // Subsequent 5-stars: count from previous 5-star to current
        const prevFiveStar = allFiveStarsUpToThis[prevFiveStarIndex];
        const prevIndex = allTypePulls.findIndex(
          (pull) => pull.id === prevFiveStar.id
        );
        const currentIndex = allTypePulls.findIndex(
          (pull) => pull.id === fiveStar.id
        );
        pityCount = currentIndex - prevIndex - 1;
      }

      // Calculate how many pulls were during this banner period
      const pityStartIndex =
        prevFiveStarIndex < 0
          ? 0
          : allTypePulls.findIndex(
              (pull) => pull.id === allFiveStarsUpToThis[prevFiveStarIndex].id
            ) + 1;
      const pityEndIndex = allTypePulls.findIndex(
        (pull) => pull.id === fiveStar.id
      );

      const pitySequence = allTypePulls.slice(pityStartIndex, pityEndIndex + 1);
      const rollsDuringBanner = pitySequence.filter((p) => {
        const pTime = new Date(p.time);
        return pTime >= bannerStart && pTime <= bannerEnd;
      }).length;

      pullsWithRolls.push({
        pull: fiveStar,
        rolls: pityCount,
        isWin: fiveStar.result === "WIN",
        rollsDuringBanner,
      });
    });

    return pullsWithRolls;
  }, [banner, pulls]);

  // Calculate carry pity summary stats
  const carryPityStats = useMemo(() => {
    // Calculate total pulls made specifically on this banner (same gacha_id only)
    const totalPulls = pulls.filter((pull) => {
      return pull.gacha_id === banner.gacha_id;
    }).length;

    // Calculate pity at the END of this specific banner period
    const bannerStart = new Date(banner.startDate);
    const bannerEnd = new Date(banner.endDate);

    // Find all pulls of same gacha_type, sorted chronologically (oldest to newest)
    const allTypePulls = pulls
      .filter((pull) => pull.gacha_type === banner.type)
      .sort((a, b) => parseInt(a.id) - parseInt(b.id));

    // Find all pulls up to the end of this banner (including previous banners)
    const pullsUpToBannerEnd = allTypePulls.filter((pull) => {
      const pullDate = new Date(pull.time);
      return pullDate <= bannerEnd;
    });

    // Find all 5-star pulls up to the end of this banner
    const fiveStarsUpToBannerEnd = pullsUpToBannerEnd.filter(
      (pull) => pull.rank_type === "5"
    );

    // Calculate total pity used for all 5-stars up to banner end
    let totalPityUsed = 0;
    let lastFiveStarIndex = -1;

    fiveStarsUpToBannerEnd.forEach((fiveStar) => {
      // Find this 5-star's position in all pulls up to banner end
      const fiveStarIndex = pullsUpToBannerEnd.findIndex(
        (pull) => pull.id === fiveStar.id
      );

      // Calculate pity for this 5-star (pulls since last 5-star + 1)
      const pityForThisFiveStar = fiveStarIndex - lastFiveStarIndex;
      totalPityUsed += pityForThisFiveStar;
      lastFiveStarIndex = fiveStarIndex;
    });

    // Carry over = Total pulls up to banner end - Pity used for 5-stars
    const currentPity = pullsUpToBannerEnd.length - totalPityUsed;

    return { totalCarryPity: currentPity, totalPulls };
  }, [banner, pulls]);

  const getItemIcon = (itemId: string, itemName: string) => {
    if (bannerType === "character" || bannerType === "departure") {
      return (
        <Image
          src={getCharacterIcon(itemId)}
          alt={itemName}
          width={64}
          height={64}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = getCharacterIcon("1001"); // Fallback to March 7th
          }}
        />
      );
    } else {
      return (
        <Image
          src={getLightConePortrait(itemId)}
          alt={itemName}
          width={64}
          height={64}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = getLightConePortrait("20000"); // Fallback to a default light cone
          }}
        />
      );
    }
  };

  if (!stats) {
    // Show a placeholder card for banners without stats
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card className="opacity-60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <CardTitle className="text-lg">{banner.name}</CardTitle>
                  <CardDescription>
                    {new Date(banner.startDate).toLocaleDateString()} -{" "}
                    {new Date(banner.endDate).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary">No Data</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Total Pulls</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">0</div>
                <div className="text-sm text-muted-foreground">5★ Pulls</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">0</div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0%</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">0</div>
                <div className="text-sm text-muted-foreground">Carry Over</div>
              </div>
            </div>

            {/* Win Rate Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Win Rate</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>

            {/* Pickup Items */}
            {banner.pickupItems && banner.pickupItems.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Pickup Items:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {banner.pickupItems.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col items-center space-y-1 p-2"
                    >
                      <div className="relative">
                        <div
                          className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${
                            item.rarity === 5
                              ? "border-yellow-400/70"
                              : "border-purple-500/70"
                          }`}
                        >
                          {getItemIcon(item.id, item.name)}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex">
                          {Array.from({ length: item.rarity }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 fill-current ${
                                item.rarity === 5
                                  ? "text-yellow-400"
                                  : "text-purple-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-center font-medium leading-tight max-w-full">
                        <span className="block truncate px-1">{item.name}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <CardTitle className="text-lg">{banner.name}</CardTitle>
                <CardDescription>
                  {new Date(banner.startDate).toLocaleDateString()} -{" "}
                  {new Date(banner.endDate).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isBannerActive(banner) ? "default" : "secondary"}>
              {isBannerActive(banner) ? "Active" : "Ended"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {carryPityStats.totalPulls}
              </div>
              <div className="text-sm text-muted-foreground">Total Pulls</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.fiveStarPulls}
              </div>
              <div className="text-sm text-muted-foreground">5★ Pulls</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {stats.winCount}
              </div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {carryPityStats.totalCarryPity}
              </div>
              <div className="text-sm text-muted-foreground">Carry Over</div>
            </div>
          </div>

          {/* Expand/Collapse Button for 5★ Details */}
          {bannerFiveStarPulls.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-2"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span>
                  {isExpanded ? "Hide" : "Show"} 5★{" "}
                  {bannerType === "character" ? "Characters" : "Light Cones"} (
                  {bannerFiveStarPulls.length})
                </span>
              </Button>
            </div>
          )}

          {/* Expanded 5★ Items List */}
          {isExpanded && bannerFiveStarPulls.length > 0 && (
            <div className="mt-3 space-y-2">
              {bannerFiveStarPulls
                .slice()
                .reverse()
                .map((pullData, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-yellow-400/50">
                          {getItemIcon(
                            pullData.pull.item_id,
                            pullData.pull.name
                          )}
                        </div>
                        <div
                          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-background ${
                            pullData.isWin ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {pullData.pull.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(pullData.pull.time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold text-sm ${
                          pullData.rolls <= 39
                            ? "text-green-500"
                            : pullData.rolls <= 69
                            ? "text-orange-500"
                            : "text-red-500"
                        }`}
                      >
                        {pullData.rolls} pulls
                      </div>
                      <div className="text-xs text-blue-500 font-medium">
                        ({pullData.rollsDuringBanner} during banner)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pullData.isWin ? "WIN" : "LOSE"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Win Rate Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Win Rate</span>
              <span>{stats.winRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.winRate} className="h-2" />
          </div>

          {/* Pickup Items */}
          {banner.pickupItems && banner.pickupItems.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Pickup Items:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {banner.pickupItems.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col items-center space-y-1 p-2"
                  >
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${
                          item.rarity === 5
                            ? "border-yellow-400/70"
                            : "border-purple-500/70"
                        }`}
                      >
                        {getItemIcon(item.id, item.name)}
                      </div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex">
                        {Array.from({ length: item.rarity }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 fill-current ${
                              item.rarity === 5
                                ? "text-yellow-400"
                                : "text-purple-500"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-center font-medium leading-tight max-w-full">
                      <span className="block truncate px-1">{item.name}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
