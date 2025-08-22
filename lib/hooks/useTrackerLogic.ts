import { useEffect, useState, useMemo, useCallback } from "react";
import { Log } from "@/models/GachaLog";
import {
  useGachaLog,
  useGachaBanners,
  useGachaPulls,
} from "@/lib/Context/gacha-logs-provider";
import { RecentModel } from "@/components/custom/ScrollMenu/scrollmenu";
import { convertLogToGachaPull, calculateBannerStats } from "@/lib/utils";

export interface TrackerLogicConfig {
  gachaType: string;
  logType: "character" | "lightCone" | "fate";
  fateSubType?: "21" | "22"; // For fate banners, specify character (21) or light cone (22)
}

export function useTrackerLogic(config: TrackerLogicConfig) {
  const { logs } = useGachaLog();
  const { banners, bannerStats } = useGachaBanners();
  const { enhancedPulls } = useGachaPulls();
  const [recentList, setRecentList] = useState<RecentModel[]>([]);
  const [showEmptyBanners, setShowEmptyBanners] = useState(false);

  // Get filtered banners based on gacha type
  const filteredBanners = useMemo(() => {
    const filtered = banners.filter(
      (banner) => banner.type === config.gachaType
    );

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
  }, [banners, bannerStats, showEmptyBanners, config.gachaType]);

  // Get filtered pulls based on gacha type
  const filteredPulls = useMemo(() => {
    return enhancedPulls.filter((pull) => pull.gacha_type === config.gachaType);
  }, [enhancedPulls, config.gachaType]);

  // Calculate enhanced win data with banner context
  const getEnhancedWinData = useCallback(
    (pulls = filteredPulls) => {
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
          // Calculate the number of pulls from the previous 5-star to the current 5-star
          // Subtract 1 to exclude the previous 5-star from the count
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
    [filteredPulls]
  );

  // Legacy getWinData for backward compatibility
  const getWinData = useCallback(
    (original: Log[]) => {
      const enhancedPulls = original.map((log) => convertLogToGachaPull(log));
      return getEnhancedWinData(enhancedPulls);
    },
    [getEnhancedWinData]
  );

  // Calculate overall stats
  const stats = useMemo(() => {
    return calculateBannerStats(filteredPulls);
  }, [filteredPulls]);

  // Get the appropriate log data based on config
  const logData = useMemo(() => {
    if (config.logType === "fate" && config.fateSubType) {
      return logs.fate.filter((log) => log.gacha_type === config.fateSubType);
    }
    return logs[config.logType];
  }, [logs, config.logType, config.fateSubType]);

  // Update recent list when enhanced pulls change
  useEffect(() => {
    if (filteredPulls.length > 0) {
      setRecentList(getEnhancedWinData(filteredPulls));
    } else if (
      config.logType === "fate" &&
      logs.fate.length > 0 &&
      config.fateSubType
    ) {
      // Filter fate logs for specific subtype
      const fateLogs = logs.fate.filter(
        (log) => log.gacha_type === config.fateSubType
      );
      setRecentList(getWinData(fateLogs));
    } else if (logData.length > 0) {
      setRecentList(getWinData(logData));
    }
  }, [
    filteredPulls,
    logs.fate,
    config.logType,
    config.fateSubType,
    logData,
    getEnhancedWinData,
    getWinData,
  ]);

  return {
    // Data
    banners: filteredBanners,
    pulls: filteredPulls,
    logData,
    recentList,
    stats,
    bannerStats,
    enhancedPulls,

    // State
    showEmptyBanners,
    setShowEmptyBanners,

    // Functions
    getEnhancedWinData,
    getWinData,
  };
}
