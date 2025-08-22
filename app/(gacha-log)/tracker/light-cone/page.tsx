"use client";
import React from "react";
import { TrackerPageBase } from "@/components/custom";
import { BannerType } from "@/lib/constant";
import { Zap } from "lucide-react";

function TrackerLightCone() {
  const pageConfig = {
    title: "Light Cone Event Warp",
    description:
      "Analysis of your Light Cone Event Warp history with WIN/LOSE tracking. Only shows Light Cone Event Warp banners.",
    icon: Zap,
    highlightColor: "text-blue-500",
    itemLabel: "5★ Light Cones",
    scrollMenuTitle: "Recent 5-Star Light Cones",
    bannerAnalysisTitle:
      "Analyze your pulls across different light cone banners",
    bannerType: "lightcone" as const,
    bannerTypeEnum: BannerType.LightCone,
    showJadeCost: true,
    emptyStateTitle: "No Light Cone Data",
    emptyStateDescription:
      "No pull data found for Light Cone Event Warp banners. Light Cone Event Warp banner configurations may not be available yet.",
  };

  const logicConfig = {
    gachaType: "12",
    logType: "lightCone" as const,
  };

  return <TrackerPageBase config={pageConfig} logicConfig={logicConfig} />;
}

export default TrackerLightCone;
