"use client";
import React from "react";
import { TrackerPageBase } from "@/components/custom";
import { BannerType } from "@/lib/constant";
import { Sparkles } from "lucide-react";

function FateLightConePage() {
  const pageConfig = {
    title: "Fate Collaboration - Light Cones",
    description:
      "Analysis of your Fate Collaboration light cone pulls. Features signature weapons designed for Fate characters.",
    icon: Sparkles,
    highlightColor: "text-amber-500",
    itemLabel: "5★ Light Cones",
    scrollMenuTitle: "Recent 5-Star Fate Light Cones",
    bannerAnalysisTitle:
      "Analyze your pulls across Fate collaboration light cone banners",
    bannerType: "lightcone" as const,
    bannerTypeEnum: BannerType.LightCone,
    customMetricLabel: "Collaboration Items",
    customMetricColor: "text-amber-500",
    analyticsTitle2: "Fate Light Cone Stats",
    backRoute: "/tracker/special",
    backLabel: "Back to Special Banners",
    emptyStateTitle: "No Fate Light Cone Data",
    emptyStateDescription:
      "No pull data found for Fate Collaboration light cone banners.",
    emptyStateIcon: Sparkles,
    isCollaboration: true,
  };

  const logicConfig = {
    gachaType: "22",
    logType: "fate" as const,
    fateSubType: "22" as const,
  };

  return <TrackerPageBase config={pageConfig} logicConfig={logicConfig} />;
}

export default FateLightConePage;
