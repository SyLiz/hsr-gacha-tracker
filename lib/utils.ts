import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Log,
  GachaPull,
  GachaBanner,
  GachaTypeMapping,
  TimelineEvent,
  BannerStats,
  PityCounter,
} from "@/models/GachaLog";
import {
  GACHA_TYPE_MAPPINGS,
  CONFIGURED_BANNERS,
  getBannerForPullTime,
  getGachaTypeMappingByValue,
} from "./constant";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = (url: string) =>
  fetch(url).then(async (response) => {
    if (!response.ok) {
      throw new Error(response.statusText, { cause: await response.json() });
    }
    return response.json();
  });

export function objectToUrlParams(obj: any): string {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
}

export function sortById(list: Log[]) {
  return list.sort((a, b) => b.id.localeCompare(a.id));
}

export function getArrNotDuplicates(
  arr: Log[],
  checkMap: any,
  onEnd: () => void
): Log[] {
  if (!checkMap) return arr;
  var tempArr: Log[] = [];
  for (let item of arr) {
    if (item.id in checkMap) {
      onEnd();
      break;
    }
    tempArr.push(item);
  }
  return tempArr;
}

export const createMapById = (arr: Log[]): Record<string, Log> => {
  return arr.reduce((map, obj) => {
    map[obj.id] = obj;
    return map;
  }, {} as Record<string, Log>);
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

// Enhanced gacha utilities for the new system

export const resolveGachaType = (gachaType: string): GachaTypeMapping => {
  return (
    getGachaTypeMappingByValue(gachaType) || {
      key: "1",
      name: "Standard",
      type: "1",
    }
  );
};

export const getBannerByGachaId = (
  gachaId: string,
  banners: GachaBanner[] = CONFIGURED_BANNERS
): GachaBanner | undefined => {
  return banners.find((banner) => banner.gacha_id === gachaId);
};

export const determineResult = (
  pull: Log,
  gachaType: string,
  banners: GachaBanner[] = CONFIGURED_BANNERS
): "WIN" | "LOSE" => {
  // For 3-star items, always LOSE
  if (pull.rank_type === "3") {
    return "LOSE";
  }

  // For 4-star items in gacha_type "1" (Standard), always LOSE (no rate-up)
  if (pull.rank_type === "4" && gachaType === "1") {
    return "LOSE";
  }

  // Find banner by gacha_id (exact match)
  const banner = getBannerByGachaId(pull.gacha_id, banners);

  if (!banner || banner.pickupItems.length === 0) {
    return "LOSE"; // Standard banner or no pickup items
  }

  // Check if the pulled item_id matches any pickup item id in the banner
  const isPickup = banner.pickupItems.some((item) => item.id === pull.item_id);

  return isPickup ? "WIN" : "LOSE";
};

export const parseGachaJSON = (jsonData: string): GachaPull[] => {
  try {
    const data = JSON.parse(jsonData);
    return (
      data.data?.list?.map((pull: any) => {
        const result = determineResult(pull, pull.gacha_type);
        const bannerContext = getBannerForPullTime(pull.time);

        return {
          ...pull,
          isPickup: result === "WIN",
          result,
          bannerContext,
        } as GachaPull;
      }) || []
    );
  } catch (error) {
    console.error("Failed to parse gacha JSON:", error);
    return [];
  }
};

export const convertLogToGachaPull = (log: Log): GachaPull => {
  const result = determineResult(log, log.gacha_type);
  const bannerContext = getBannerForPullTime(log.time);

  return {
    ...log,
    isPickup: result === "WIN",
    result,
    bannerContext,
  };
};

export const getPullsInBannerPeriod = (
  banner: GachaBanner,
  pulls: GachaPull[]
): GachaPull[] => {
  const start = new Date(banner.startDate);
  const end = new Date(banner.endDate);

  return pulls.filter((pull) => {
    const pullDate = new Date(pull.time);
    return pullDate >= start && pullDate <= end;
  });
};

export const generateTimelineEvents = (
  pulls: GachaPull[],
  banners: GachaBanner[] = CONFIGURED_BANNERS
): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // Add banner events
  banners.forEach((banner) => {
    events.push({
      type: "banner_start",
      date: banner.startDate + "T00:00:00",
      data: banner,
    });
    events.push({
      type: "banner_end",
      date: banner.endDate + "T23:59:59",
      data: banner,
    });
  });

  // Add pull events with banner context
  pulls.forEach((pull) => {
    const activeBanner = getBannerForPullTime(pull.time, banners);
    events.push({
      type: "pull",
      date: pull.time,
      data: pull,
      bannerContext: activeBanner,
    });
  });

  // Sort by date
  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const calculateBannerStats = (
  pulls: GachaPull[],
  banner?: GachaBanner
): BannerStats => {
  // Don't re-filter when banner is provided - the context provider already
  // filters pulls correctly by gacha_id, gacha_type, and time range
  const relevantPulls = pulls;

  const totalPulls = relevantPulls.length;
  const fiveStarPulls = relevantPulls.filter((p) => p.rank_type === "5");
  const fourStarPulls = relevantPulls.filter((p) => p.rank_type === "4");
  const winPulls = fiveStarPulls.filter((p) => p.result === "WIN");
  const losePulls = fiveStarPulls.filter((p) => p.result === "LOSE");

  const winRate =
    fiveStarPulls.length > 0
      ? (winPulls.length / fiveStarPulls.length) * 100
      : 0;

  // Calculate average pity (pulls between 5-stars)
  const sortedPulls = [...relevantPulls].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );
  const pityDistances: number[] = [];
  let currentPity = 0;

  // Calculate current pity using the same logic as "Rolls Since Last 5-Star"
  // Sort pulls newest to oldest to match SummarySector logic
  const newestFirstPulls = [...relevantPulls].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  // Find the first 5-star from newest pulls (same as SummarySector.getCountRollsSinceLast5Star)
  currentPity = newestFirstPulls.length; // Default: all pulls if no 5-star found
  for (let i = 0; i < newestFirstPulls.length; i++) {
    if (newestFirstPulls[i].rank_type === "5") {
      currentPity = i; // Index = number of pulls since last 5-star
      break;
    }
  }

  // Calculate pity distances for average calculation
  let tempPity = 0;
  for (const pull of sortedPulls) {
    tempPity++;
    if (pull.rank_type === "5") {
      pityDistances.push(tempPity);
      tempPity = 0;
    }
  }

  const averagePity =
    pityDistances.length > 0
      ? pityDistances.reduce((sum, pity) => sum + pity, 0) /
        pityDistances.length
      : 0;

  return {
    totalPulls,
    fiveStarPulls: fiveStarPulls.length,
    fourStarPulls: fourStarPulls.length,
    winCount: winPulls.length,
    loseCount: losePulls.length,
    winRate,
    averagePity,
    currentPity: currentPity,
  };
};

export const calculatePityCounter = (pulls: GachaPull[]): PityCounter => {
  const sortedPulls = [...pulls].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  let sinceLastFiveStar = 0;
  let sinceLastFourStar = 0;
  let foundFiveStar = false;
  let foundFourStar = false;

  for (const pull of sortedPulls) {
    if (!foundFiveStar) {
      sinceLastFiveStar++;
      if (pull.rank_type === "5") {
        foundFiveStar = true;
        sinceLastFiveStar--; // Don't count the 5-star pull itself
      }
    }

    if (!foundFourStar) {
      sinceLastFourStar++;
      if (pull.rank_type === "4" || pull.rank_type === "5") {
        foundFourStar = true;
        sinceLastFourStar--; // Don't count the 4+ star pull itself
      }
    }

    if (foundFiveStar && foundFourStar) break;
  }

  return {
    current: sinceLastFiveStar,
    sinceLastFiveStar: foundFiveStar ? sinceLastFiveStar : pulls.length,
    sinceLastFourStar: foundFourStar ? sinceLastFourStar : pulls.length,
  };
};

export const groupPullsByDate = (
  pulls: GachaPull[]
): Record<string, GachaPull[]> => {
  return pulls.reduce((groups, pull) => {
    const date = pull.time.split(" ")[0]; // Extract date part
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(pull);
    return groups;
  }, {} as Record<string, GachaPull[]>);
};

export const formatPullTime = (timeStr: string): string => {
  try {
    const date = new Date(timeStr);
    return date.toLocaleString();
  } catch {
    return timeStr;
  }
};
