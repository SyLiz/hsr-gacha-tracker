export interface GachaLogs {
  page: string;
  size: string;
  list: Log[];
  region: string;
  region_time_zone: number;
}

export interface Log {
  uid: string;
  gacha_id: string;
  gacha_type: string;
  item_id: string;
  count: string;
  time: string;
  name: string;
  lang: string;
  item_type: string;
  rank_type: string;
  id: string;
}

// Enhanced types for the new gacha tracking system
export interface PickupItem {
  id: string;
  name: string;
  type: "Character" | "Light Cone";
  rarity: number; // 3, 4, or 5
}

export interface GachaBanner {
  gacha_id: string;
  name: string;
  type: string; // Use gacha_type values like "11", "12", "1", etc.
  startDate: string; // "2024-12-17"
  endDate: string; // "2025-01-07"
  pickupItems: PickupItem[];
}

export interface GachaPull extends Log {
  isPickup: boolean;
  result: "WIN" | "LOSE";
  bannerContext?: GachaBanner; // Which banner was active during this pull
}

export interface GachaTypeMapping {
  key: string;
  name: string;
  type: string; // Use gacha_type values consistently
}

export interface TimelineEvent {
  type: "pull" | "banner_start" | "banner_end";
  date: string;
  data: GachaPull | GachaBanner;
  bannerContext?: GachaBanner;
}

export interface BannerStats {
  totalPulls: number;
  fiveStarPulls: number;
  fourStarPulls: number;
  winCount: number;
  loseCount: number;
  winRate: number;
  averagePity: number;
  currentPity: number;
}

export interface PityCounter {
  current: number;
  sinceLastFiveStar: number;
  sinceLastFourStar: number;
}
