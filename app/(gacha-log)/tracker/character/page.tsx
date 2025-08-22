"use client";
import React from "react";
import { TrackerPageBase } from "@/components/custom";
import { BannerType } from "@/lib/constant";
import { Trophy } from "lucide-react";

function TrackerCharacter() {
  const pageConfig = {
    title: "Character Event Warp",
    description:
      "Analysis of your Character Event Warp history with WIN/LOSE tracking. Only shows Character Event Warp banners.",
    icon: Trophy,
    highlightColor: "text-blue-500",
    itemLabel: "5★ Characters",
    scrollMenuTitle: "Recent 5-Star Characters",
    bannerAnalysisTitle:
      "Analyze your pulls across different character banners",
    bannerType: "character" as const,
    bannerTypeEnum: BannerType.Character,
    showJadeCost: true,
    emptyStateTitle: "No Character Data",
    emptyStateDescription:
      "No pull data found for Character Event Warp banners.",
  };

  const logicConfig = {
    gachaType: "11",
    logType: "character" as const,
  };

  return <TrackerPageBase config={pageConfig} logicConfig={logicConfig} />;
}

export default TrackerCharacter;
