"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Log, GachaPull } from "@/models/GachaLog";
import {
  getAssetFromLog,
  getFallbackImage,
  getRarityColor,
  normalizeItemType,
} from "@/lib/assets";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Star, Trophy, Target, Calendar, Zap, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: Log | GachaPull;
  rolls?: number;
  isWin?: boolean;
  showDetails?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  onClick?: () => void;
  bannerType?: string; // Banner type for roll color logic
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  rolls = 0,
  isWin,
  showDetails = false,
  size = "md",
  onClick,
  bannerType,
}) => {
  const [imageError, setImageError] = useState(false);
  const isEnhanced = "result" in character;
  const rarity = parseInt(character.rank_type);
  const rarityColor = getRarityColor(rarity);

  // Get roll color based on banner type and roll count
  const getRollColor = (rollCount: number, bannerType?: string) => {
    if (rollCount <= 0) return "bg-background";

    // Determine banner type for thresholds
    const isDepartureBanner = bannerType === "2";
    const isCharacterBanner = bannerType === "11" || bannerType === "21";
    const isLightConeBanner = bannerType === "12" || bannerType === "22";

    if (isDepartureBanner) {
      // Departure warp thresholds (50 max pity): 1-19 green, 20-39 orange, 40+ red
      if (rollCount >= 1 && rollCount <= 19) return "bg-green-500";
      if (rollCount >= 20 && rollCount <= 39) return "bg-orange-500";
      if (rollCount >= 40) return "bg-red-500";
    } else if (isCharacterBanner) {
      // Character banner thresholds: 1-39 green, 40-69 orange, 70+ red
      if (rollCount >= 1 && rollCount <= 39) return "bg-green-500";
      if (rollCount >= 40 && rollCount <= 69) return "bg-orange-500";
      if (rollCount >= 70) return "bg-red-500";
    } else if (isLightConeBanner) {
      // Light cone banner thresholds: 1-29 green, 30-59 orange, 60+ red
      if (rollCount >= 1 && rollCount <= 29) return "bg-green-500";
      if (rollCount >= 30 && rollCount <= 59) return "bg-orange-500";
      if (rollCount >= 60) return "bg-red-500";
    }

    // Default color for standard banner or when banner type is not specified
    return "bg-background";
  };

  // Get text color for roll counter
  const getRollTextColor = (rollCount: number, bannerType?: string) => {
    const bgColor = getRollColor(rollCount, bannerType);

    // Use white text for colored backgrounds, default text color for background
    if (
      bgColor.includes("green") ||
      bgColor.includes("orange") ||
      bgColor.includes("red")
    ) {
      return "text-white";
    }
    return "text-foreground";
  };

  // Auto-detect banner type from character data if not provided
  const effectiveBannerType = bannerType || character.gacha_type;

  // Size configurations
  const sizeConfig = {
    xs: {
      container: "w-12 h-12",
      border: "border-2",
      text: "text-xs",
      badge: "text-xs px-1 py-0.5",
      pityBadge: "w-4 h-4 text-[8px]",
    },
    sm: {
      container: "w-16 h-16",
      border: "border-2",
      text: "text-sm",
      badge: "text-xs px-1.5 py-0.5",
      pityBadge: "w-5 h-5 text-[10px]",
    },
    md: {
      container: "w-20 h-20",
      border: "border-3",
      text: "text-base",
      badge: "text-sm px-2 py-1",
      pityBadge: "w-6 h-6 text-xs",
    },
    lg: {
      container: "w-24 h-24",
      border: "border-3",
      text: "text-lg",
      badge: "text-sm px-3 py-1",
      pityBadge: "w-7 h-7 text-sm",
    },
  };

  const config = sizeConfig[size];

  // Get character/light cone image URL
  const imageUrl = !imageError
    ? getAssetFromLog(character, "avatar")
    : getFallbackImage(character.item_type);

  const handleImageError = () => {
    setImageError(true);
  };

  // Determine win/loss status
  const getResultInfo = () => {
    if (isEnhanced && "result" in character) {
      return {
        result: character.result,
        color: character.result === "WIN" ? "text-green-500" : "text-red-500",
        bgColor:
          character.result === "WIN" ? "bg-green-500/10" : "bg-red-500/10",
        icon: character.result === "WIN" ? Trophy : Target,
      };
    } else if (typeof isWin === "boolean") {
      return {
        result: isWin ? "WIN" : "LOSE",
        color: isWin ? "text-green-500" : "text-red-500",
        bgColor: isWin ? "bg-green-500/10" : "bg-red-500/10",
        icon: isWin ? Trophy : Target,
      };
    }
    return null;
  };

  const resultInfo = getResultInfo();

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "relative group cursor-pointer",
              config.container,
              onClick && "hover:scale-110 transition-all duration-200"
            )}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {/* Main Circle Avatar */}
            <div
              className={cn(
                "w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-background to-muted relative",
                config.border,
                resultInfo?.bgColor
              )}
              style={{ borderColor: rarityColor }}
            >
              <Image
                src={imageUrl}
                alt={character.name}
                fill
                className="object-cover"
                onError={handleImageError}
                unoptimized
              />

              {/* Gradient overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Rarity indicator - small stars overlay */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-0.5">
                <div className="flex space-x-0.5">
                  {Array.from({ length: Math.min(rarity, 3) }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-2 h-2 fill-yellow-400 text-yellow-400 drop-shadow-sm"
                    />
                  ))}
                  {rarity > 3 && (
                    <span className="text-yellow-400 text-xs font-bold drop-shadow-sm">
                      +{rarity - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Result indicator - corner badge - only show for non-standard banners */}
              {resultInfo && bannerType !== "1" && (
                <div className="absolute -top-1 -right-1">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full border-2 border-background shadow-sm",
                      resultInfo.result === "WIN"
                        ? "bg-green-500"
                        : "bg-red-500"
                    )}
                  />
                </div>
              )}

              {/* Banner type indicator */}
              {isEnhanced &&
                "bannerContext" in character &&
                character.bannerContext && (
                  <div className="absolute -top-1 -left-1">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border-2 border-background shadow-sm"
                      )}
                      style={{
                        backgroundColor:
                          character.bannerContext.type === "11"
                            ? "#FF6B6B"
                            : character.bannerContext.type === "12"
                            ? "#4ECDC4"
                            : "#9B59B6",
                      }}
                    />
                  </div>
                )}
            </div>

            {/* Pity counter - floating badge */}
            {rolls > 0 && (
              <div className="absolute -bottom-1 -right-1">
                <div
                  className={cn(
                    "rounded-full border-2 border-muted flex items-center justify-center font-bold shadow-md",
                    config.pityBadge,
                    getRollColor(rolls, effectiveBannerType),
                    getRollTextColor(rolls, effectiveBannerType)
                  )}
                  style={{
                    borderColor: getRollColor(
                      rolls,
                      effectiveBannerType
                    ).includes("bg-background")
                      ? rarityColor
                      : "transparent",
                  }}
                >
                  {rolls}
                </div>
              </div>
            )}
          </motion.div>
        </TooltipTrigger>

        <TooltipContent side="top" className="max-w-sm p-4">
          <div className="space-y-3">
            {/* Header with name and rarity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {Array.from({ length: rarity }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="font-semibold text-sm">{character.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {normalizeItemType(character.item_type)}
              </Badge>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 gap-2 text-sm">
              {/* Date and time */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">{formatDate(character.time)}</span>
              </div>

              {/* Pity information */}
              {rolls > 0 && (
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs">
                    Pity: <span className="font-medium">{rolls}</span> pulls
                  </span>
                </div>
              )}

              {/* Win/Loss result - only show for non-standard banners */}
              {resultInfo && bannerType !== "1" && (
                <div className="flex items-center space-x-2">
                  <resultInfo.icon
                    className={cn("w-3 h-3", resultInfo.color)}
                  />
                  <span className={cn("text-xs font-medium", resultInfo.color)}>
                    {resultInfo.result}
                    {resultInfo.result === "WIN" ? " (Rate-up)" : " (Standard)"}
                  </span>
                </div>
              )}

              {/* Banner context */}
              {isEnhanced &&
                "bannerContext" in character &&
                character.bannerContext && (
                  <div className="border-t pt-2">
                    <div className="flex items-start space-x-2">
                      <Info className="w-3 h-3 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium">
                          {character.bannerContext.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {character.bannerContext.type === "11" &&
                            "Character Event"}
                          {character.bannerContext.type === "12" &&
                            "Light Cone Event"}
                          {character.bannerContext.type === "1" &&
                            "Standard Warp"}
                          {character.bannerContext.type === "2" &&
                            "Departure Warp"}
                          {character.bannerContext.type === "21" &&
                            "Fate Character"}
                          {character.bannerContext.type === "22" &&
                            "Fate Light Cone"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Item ID for debugging */}
              {showDetails && (
                <div className="text-xs text-muted-foreground border-t pt-1">
                  ID: {character.item_id} | Gacha: {character.gacha_id}
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CharacterCard;
