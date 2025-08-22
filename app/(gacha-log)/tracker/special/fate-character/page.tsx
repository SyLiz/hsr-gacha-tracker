"use client";
import React from "react";
import { TrackerPageBase } from "@/components/custom";
import { BannerType } from "@/lib/constant";
import { Trophy } from "lucide-react";

function FateCharacterPage() {
  const pageConfig = {
    title: "Fate Collaboration - Characters",
    description:
      "Analysis of your Fate Collaboration character pulls. Features special characters from the Fate series with unique abilities.",
    icon: Trophy,
    highlightColor: "text-purple-500",
    itemLabel: "5★ Characters",
    scrollMenuTitle: "Recent 5-Star Fate Characters",
    bannerAnalysisTitle:
      "Analyze your pulls across Fate collaboration character banners",
    bannerType: "character" as const,
    bannerTypeEnum: BannerType.Character,
    customMetricLabel: "Collaboration Items",
    customMetricColor: "text-purple-500",
    analyticsTitle2: "Fate Character Stats",
    backRoute: "/tracker/special",
    backLabel: "Back to Special Banners",
    emptyStateTitle: "No Fate Character Data",
    emptyStateDescription:
      "No pull data found for Fate Collaboration character banners.",
    emptyStateIcon: Trophy,
    isCollaboration: true,
  };

  const logicConfig = {
    gachaType: "21",
    logType: "fate" as const,
    fateSubType: "21" as const,
  };

  return <TrackerPageBase config={pageConfig} logicConfig={logicConfig} />;
}

export default FateCharacterPage;
