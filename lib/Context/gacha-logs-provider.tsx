"use client";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Log, GachaPull, GachaBanner, BannerStats } from "@/models/GachaLog";
import {
  sortById,
  convertLogToGachaPull,
  calculateBannerStats,
} from "../utils";
import { CONFIGURED_BANNERS, getActiveBanners } from "../constant";

// Define the type for your object
interface GachaLogType {
  character: Log[];
  lightCone: Log[];
  standard: Log[];
  fate: Log[];
}

// Enhanced context with banner support
interface GachaLogContextType {
  logs: GachaLogType;
  setLogs: React.Dispatch<React.SetStateAction<GachaLogType>>;
  // New enhanced features
  banners: GachaBanner[];
  setBanners: React.Dispatch<React.SetStateAction<GachaBanner[]>>;
  enhancedPulls: GachaPull[];
  bannerStats: Record<string, BannerStats>;
  overallStats: BannerStats;
  // Helper functions
  getEnhancedPulls: () => GachaPull[];
  getBannerStats: (bannerId?: string) => BannerStats;
  refreshBannerData: () => void;
}

// Create the context
const GachaLogContext = createContext<GachaLogContextType | undefined>(
  undefined
);

// Create a provider component
export const GachaLogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [logs, setLogs] = useState<GachaLogType>({
    character: [],
    lightCone: [],
    standard: [],
    fate: [],
  });

  const [banners, setBanners] = useState<GachaBanner[]>([]);
  const [enhancedPulls, setEnhancedPulls] = useState<GachaPull[]>([]);
  const [bannerStats, setBannerStats] = useState<Record<string, BannerStats>>(
    {}
  );
  const [overallStats, setOverallStats] = useState<BannerStats>({
    totalPulls: 0,
    fiveStarPulls: 0,
    fourStarPulls: 0,
    winCount: 0,
    loseCount: 0,
    winRate: 0,
    averagePity: 0,
    currentPity: 0,
  });

  // Convert logs to enhanced pulls
  const getEnhancedPulls = (): GachaPull[] => {
    const pulls: GachaPull[] = [];
    Object.entries(logs).forEach(([bannerType, logList]) => {
      logList.forEach((log: Log) => {
        pulls.push(convertLogToGachaPull(log));
      });
    });
    return pulls.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  };

  // Calculate banner-specific stats
  const getBannerStats = (bannerId?: string): BannerStats => {
    if (bannerId && bannerStats[bannerId]) {
      return bannerStats[bannerId];
    }
    return overallStats;
  };

  // Refresh banner data and statistics
  const refreshBannerData = useCallback(() => {
    // Use the current banners and calculate active status dynamically
    setBanners(CONFIGURED_BANNERS);

    // Generate enhanced pulls
    const allPulls = getEnhancedPulls();
    setEnhancedPulls(allPulls);

    // Calculate overall stats
    const overallStatsData = calculateBannerStats(allPulls);
    setOverallStats(overallStatsData);

    // Calculate banner-specific stats using proper time filtering
    const bannerStatsData: Record<string, BannerStats> = {};
    CONFIGURED_BANNERS.forEach((banner: GachaBanner) => {
      // Use proper filtering: For special banners (21, 22, 2), match by gacha_type and time range
      // For regular banners (1, 11, 12), match by gacha_id, gacha_type, and time range
      const bannerPulls = allPulls.filter((pull) => {
        const pullDate = new Date(pull.time);
        const bannerStart = new Date(banner.startDate);
        const bannerEnd = new Date(banner.endDate);

        // Check that the gacha_type matches the banner type
        const isCorrectType = pull.gacha_type === banner.type;
        const isInTimeRange = pullDate >= bannerStart && pullDate <= bannerEnd;

        // For departure warp, we may be more flexible with gacha_id since it's a special case
        // For all other banners including Fate, require exact gacha_id match
        const isDepartureBanner = banner.type === "2";
        const isCorrectBanner =
          isDepartureBanner || pull.gacha_id === banner.gacha_id;

        return isCorrectBanner && isCorrectType && isInTimeRange;
      });

      if (bannerPulls.length > 0) {
        bannerStatsData[banner.gacha_id] = calculateBannerStats(
          bannerPulls,
          banner
        );
      }
    });
    setBannerStats(bannerStatsData);
  }, [logs]);

  // Initialize banners on component mount
  useEffect(() => {
    setBanners(CONFIGURED_BANNERS);
  }, []);

  // Update enhanced data when logs change
  useEffect(() => {
    refreshBannerData();
  }, [logs, refreshBannerData]);

  function setLogsByUID(uid: string, jsonObj: any) {
    const characterLogs = jsonObj[uid]?.character as Log[] | undefined;
    const lightconeLogs = jsonObj[uid]?.lightcone as Log[] | undefined;
    const standardLogs = jsonObj[uid]?.standard as Log[] | undefined;
    const fateLogs = jsonObj[uid]?.fate as Log[] | undefined;

    setLogs((prevObject) => ({
      ...prevObject,
      lightCone: sortById(lightconeLogs ?? []),
      standard: sortById(standardLogs ?? []),
      character: sortById(characterLogs ?? []),
      fate: sortById(fateLogs ?? []),
    }));
  }

  useEffect(() => {
    let uid = localStorage.getItem("selectedUid");
    let logs = localStorage.getItem("logs");
    var availableUser: string[] = [];

    if (logs) {
      try {
        let jsonObj = JSON.parse(logs);
        Object.keys(jsonObj).forEach((key) => {
          availableUser.push(key);
        });
        if (uid) {
          setLogsByUID(uid, jsonObj);
        } else if (availableUser.length > 0) {
          localStorage.setItem("selectedUid", availableUser[0]);
          setLogsByUID(availableUser[0], jsonObj);
        }
      } catch (error) {
        console.error("Failed to parse logs from localStorage:", error);
        // Clear corrupted data
        // localStorage.removeItem("logs");
        // localStorage.removeItem("selectedUid");
        // setLogs({ character: [], lightCone: [], standard: [], fate: [] });
      }
    }
  }, []);

  return (
    <GachaLogContext.Provider
      value={{
        logs,
        setLogs,
        banners,
        setBanners,
        enhancedPulls,
        bannerStats,
        overallStats,
        getEnhancedPulls,
        getBannerStats,
        refreshBannerData,
      }}
    >
      {children}
    </GachaLogContext.Provider>
  );
};

// Custom hook to consume the context
export const useGachaLog = (): GachaLogContextType => {
  const context = useContext(GachaLogContext);
  if (!context) {
    throw new Error("useGachaLog must be used within a GachaLogProvider");
  }
  return context;
};

// Enhanced hook specifically for banner data
export const useGachaBanners = () => {
  const context = useGachaLog();
  return {
    banners: context.banners,
    setBanners: context.setBanners,
    bannerStats: context.bannerStats,
    getBannerStats: context.getBannerStats,
    refreshBannerData: context.refreshBannerData,
  };
};

// Enhanced hook for pull data
export const useGachaPulls = () => {
  const context = useGachaLog();
  return {
    enhancedPulls: context.enhancedPulls,
    getEnhancedPulls: context.getEnhancedPulls,
    overallStats: context.overallStats,
  };
};
