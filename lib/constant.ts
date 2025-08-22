// Removed standartCharacters and standartLightCone arrays
// WIN/LOSE logic now uses CONFIGURED_BANNERS for accurate matching

export enum BannerType {
  Character,
  LightCone,
  Standard,
}

// Enhanced gacha type mappings for the new system
import { GachaTypeMapping, GachaBanner, Log } from "@/models/GachaLog";

// Import banner data from separate JSON files
import characterBanners from "./banners/character.json";
import lightConeBanners from "./banners/light_cone.json";
import specialBanners from "./banners/special.json";

export const GACHA_TYPE_MAPPINGS: Record<string, GachaTypeMapping> = {
  Standard: {
    key: "1",
    name: "Standard",
    type: "1",
  },
  Departure: {
    key: "2",
    name: "Departure",
    type: "2",
  },
  Character: {
    key: "11",
    name: "Character",
    type: "11",
  },
  "Light Cone": {
    key: "12",
    name: "Light Cone",
    type: "12",
  },
  "Fate Character": {
    key: "21",
    name: "Character",
    type: "21",
  },
  "Fate Light Cone": {
    key: "22",
    name: "Light Cone",
    type: "22",
  },
};

// Helper to get mapping by gacha_type value for API data processing
export const getGachaTypeMappingByValue = (
  gachaType: string
): GachaTypeMapping | null => {
  return (
    Object.values(GACHA_TYPE_MAPPINGS).find(
      (mapping) => mapping.key === gachaType
    ) || null
  );
};

// Helper to get human-readable banner type name
export const getBannerTypeName = (bannerType: string): string => {
  const mapping = getGachaTypeMappingByValue(bannerType);
  return mapping?.name || "Unknown";
};

// Helper to get banner type for display with special handling for similar types
export const getBannerTypeDisplay = (bannerType: string): string => {
  switch (bannerType) {
    case "11":
    case "21":
      return "Character";
    case "12":
    case "22":
      return "Light Cone";
    case "1":
      return "Standard";
    case "2":
      return "Departure";
    default:
      return "Unknown";
  }
};

// Combine all banners into a single array
export const CONFIGURED_BANNERS: GachaBanner[] = [
  ...(specialBanners as GachaBanner[]),
  ...(characterBanners as GachaBanner[]),
  ...(lightConeBanners as GachaBanner[]),
];

// Helper functions for banner management
export const getBannerType = (gachaType: string): GachaTypeMapping => {
  return (
    getGachaTypeMappingByValue(gachaType) || GACHA_TYPE_MAPPINGS["Standard"]
  );
};

export const isBannerActive = (banner: GachaBanner): boolean => {
  const now = new Date();
  const start = new Date(banner.startDate);
  const end = new Date(banner.endDate);
  return now >= start && now <= end;
};

export const getBannerByGachaId = (
  gachaId: string,
  banners: GachaBanner[] = CONFIGURED_BANNERS
): GachaBanner | undefined => {
  return banners.find((banner) => banner.gacha_id === gachaId);
};

export const getBannerForPullTime = (
  pullTime: string,
  banners: GachaBanner[] = CONFIGURED_BANNERS
): GachaBanner | undefined => {
  const pullDate = new Date(pullTime);
  return banners.find((banner) => {
    const start = new Date(banner.startDate);
    const end = new Date(banner.endDate);
    return pullDate >= start && pullDate <= end;
  });
};

export const getActiveBanners = (
  banners: GachaBanner[] = CONFIGURED_BANNERS
): GachaBanner[] => {
  return banners.filter((banner) => isBannerActive(banner));
};

export const validatePullResult = (
  pull: Log,
  banner: GachaBanner
): "WIN" | "LOSE" => {
  // Check if the pulled item is in the banner's pickup items
  const isPickup = banner.pickupItems.some((item) => item.id === pull.item_id);
  return isPickup ? "WIN" : "LOSE";
};
