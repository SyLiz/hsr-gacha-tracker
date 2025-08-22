"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Log, GachaPull } from "@/models/GachaLog";
import { CharacterCard } from "../CharacterCard/CharacterCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RecentModel {
  rolls: number;
  isWin: boolean;
  data: Log | GachaPull;
}

interface ScrollMenuProps {
  list: RecentModel[];
  title?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  maxItems?: number;
  showStats?: boolean;
  bannerType?: string; // Banner type for roll color logic
}

const ScrollMenuComponent: React.FC<ScrollMenuProps> = ({
  list,
  title = "Recent 5-Star Pulls",
  size = "md",
  className,
  maxItems = 20,
  showStats = true,
  bannerType,
}) => {
  const [showAll, setShowAll] = useState(false);

  // Filter 5-star pulls first
  const allFiveStarPulls = list.filter((item) => item.data.rank_type === "5");

  // Then decide how many to show based on showAll state
  const fiveStarPulls = showAll
    ? allFiveStarPulls
    : allFiveStarPulls.slice(0, maxItems);

  if (fiveStarPulls.length === 0) {
    return (
      <div className={cn("py-8", className)}>
        <div className="text-center space-y-2">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <p className="text-muted-foreground">
            No 5-star pulls yet. Keep pulling! ✨
          </p>
        </div>
      </div>
    );
  }

  // Calculate win rate and stats based on ALL 5-star items, not just displayed ones
  const totalFiveStarPulls = list.filter((item) => item.data.rank_type === "5");
  const winCount = totalFiveStarPulls.filter((p) => p.isWin).length;
  const loseCount = totalFiveStarPulls.length - winCount;
  const winRate =
    totalFiveStarPulls.length > 0
      ? (winCount / totalFiveStarPulls.length) * 100
      : 0;
  const avgPity =
    totalFiveStarPulls.length > 0
      ? Math.round(
          totalFiveStarPulls.reduce((sum, p) => sum + p.rolls, 0) /
            totalFiveStarPulls.length
        )
      : 0;

  // Grid column classes based on size
  const gridConfig = {
    xs: "grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-2",
    sm: "grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-3",
    md: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4",
    lg: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4",
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with title and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}

        {showStats && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Only show win/lose stats for non-standard banners */}
            {bannerType !== "1" && (
              <>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{winCount} Wins</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>{loseCount} Losses</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {winRate.toFixed(1)}% Win Rate
                </Badge>
              </>
            )}
            <Badge variant="outline" className="text-xs">
              ~{avgPity} Avg Pity
            </Badge>
          </div>
        )}
      </div>

      {/* Grid of character cards */}
      <div className={cn("grid", gridConfig[size])}>
        {fiveStarPulls.map((character, index) => (
          <motion.div
            key={`${character.data.id}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.05,
              duration: 0.3,
              ease: "easeOut",
            }}
            className="flex justify-center"
          >
            <CharacterCard
              character={character.data}
              rolls={character.rolls}
              isWin={character.isWin}
              size={size}
              showDetails={false}
              bannerType={bannerType}
            />
          </motion.div>
        ))}
      </div>

      {/* Show more/less button if list can be truncated */}
      {allFiveStarPulls.length > maxItems && (
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            {showAll
              ? allFiveStarPulls.length
              : Math.min(maxItems, allFiveStarPulls.length)}{" "}
            of {allFiveStarPulls.length} pulls
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs"
          >
            {showAll ? "Show Less" : "Show All"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ScrollMenuComponent;
