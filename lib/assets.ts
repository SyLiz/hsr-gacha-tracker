// Star Rail Assets Utility
// Uses item_id directly from the gacha API for accurate asset retrieval

const GITHUB_ASSETS_URL =
  process.env.NEXT_PUBLIC_GITHUB_ASSETS_URL ||
  "https://raw.githubusercontent.com/Mar-7th/StarRailRes/refs/heads/master";

// Asset types and paths (based on actual StarRailRes-master structure)
export const ASSET_PATHS = {
  CHARACTER_PORTRAIT: "/image/character_portrait",
  CHARACTER_PREVIEW: "/image/character_preview",
  CHARACTER_AVATAR: "/icon/avatar",
  CHARACTER_ICON: "/icon/character",
  LIGHT_CONE_PORTRAIT: "/image/light_cone_portrait",
  LIGHT_CONE_PREVIEW: "/image/light_cone_preview",
  LIGHT_CONE_ICON: "/icon/light_cone",
  ITEM_ICON: "/icon/item",
} as const;

// Item type mappings for different languages
export const ITEM_TYPE_MAPPINGS: Record<string, "Character" | "Light Cone"> = {
  // English
  Character: "Character",
  "Light Cone": "Light Cone",

  // Thai
  ตัวละคร: "Character",
  กรวยแสง: "Light Cone",

  // Chinese (both Simplified and Traditional use same characters)
  角色: "Character",
  光锥: "Light Cone", // Simplified
  光錐: "Light Cone", // Traditional

  // Japanese
  キャラクター: "Character",
  光円錐: "Light Cone",

  // Korean
  캐릭터: "Character",
  광추: "Light Cone",
};

/**
 * Get character avatar URL by item_id
 */
export const getCharacterAvatar = (itemId: string): string => {
  return `${GITHUB_ASSETS_URL}${ASSET_PATHS.CHARACTER_AVATAR}/${itemId}.png`;
};

/**
 * Get character icon URL by item_id
 */
export const getCharacterIcon = (itemId: string): string => {
  return `${GITHUB_ASSETS_URL}${ASSET_PATHS.CHARACTER_ICON}/${itemId}.png`;
};

/**
 * Get character portrait URL by item_id
 */
export const getCharacterPortrait = (itemId: string): string => {
  return `${GITHUB_ASSETS_URL}${ASSET_PATHS.CHARACTER_PORTRAIT}/${itemId}.png`;
};

/**
 * Get character preview URL by item_id
 */
export const getCharacterPreview = (itemId: string): string => {
  return `${GITHUB_ASSETS_URL}${ASSET_PATHS.CHARACTER_PREVIEW}/${itemId}.png`;
};

/**
 * Get light cone icon URL by item_id
 */
export const getLightConeIcon = (itemId: string): string => {
  return `${GITHUB_ASSETS_URL}${ASSET_PATHS.LIGHT_CONE_ICON}/${itemId}.png`;
};

/**
 * Get light cone portrait URL by item_id
 */
export const getLightConePortrait = (itemId: string): string => {
  return `${GITHUB_ASSETS_URL}${ASSET_PATHS.LIGHT_CONE_PORTRAIT}/${itemId}.png`;
};

/**
 * Get light cone preview URL by item_id
 */
export const getLightConePreview = (itemId: string): string => {
  return `${GITHUB_ASSETS_URL}${ASSET_PATHS.LIGHT_CONE_PREVIEW}/${itemId}.png`;
};

/**
 * Get item icon URL by item_id
 */
export const getItemIcon = (itemId: string): string => {
  return `${GITHUB_ASSETS_URL}${ASSET_PATHS.ITEM_ICON}/${itemId}.png`;
};

/**
 * Normalize item type from any language to English
 */
export const normalizeItemType = (
  itemType: string
): "Character" | "Light Cone" => {
  const normalized = ITEM_TYPE_MAPPINGS[itemType];
  if (!normalized) {
    console.warn(`Unknown item type: ${itemType}, defaulting to Character`);
    return "Character";
  }
  return normalized;
};

/**
 * Get asset URL by item_id and format type
 */
export const getAssetUrl = (
  itemId: string,
  itemType: string,
  format: "portrait" | "preview" | "icon" | "avatar" = "icon"
): string => {
  const normalizedType = normalizeItemType(itemType);

  switch (normalizedType) {
    case "Character":
      switch (format) {
        case "avatar":
          return getCharacterAvatar(itemId);
        case "portrait":
          return getCharacterPortrait(itemId);
        case "preview":
          return getCharacterPreview(itemId);
        case "icon":
        default:
          return getCharacterIcon(itemId);
      }
    case "Light Cone":
      switch (format) {
        case "portrait":
          return getLightConePortrait(itemId);
        case "preview":
          return getLightConePreview(itemId);
        case "icon":
        case "avatar": // Use icon for light cone avatar fallback
        default:
          return getLightConeIcon(itemId);
      }
    default:
      return getItemIcon(itemId);
  }
};

/**
 * Get asset URL from gacha log entry
 * Convenience function that extracts item_id and item_type from log entry
 * Automatically handles language normalization
 */
export const getAssetFromLog = (
  logEntry: { item_id: string; item_type: string },
  format: "portrait" | "icon" | "avatar" = "avatar"
): string => {
  return getAssetUrl(
    logEntry.item_id,
    logEntry.item_type, // No need to cast, normalizeItemType handles it
    format
  );
};

/**
 * Fallback image for when assets fail to load
 */
export const getFallbackImage = (itemType: string): string => {
  const normalizedType = normalizeItemType(itemType);
  // Return a default placeholder using known working IDs
  return normalizedType === "Character"
    ? getCharacterAvatar("1001") // March 7th as fallback
    : getLightConeIcon("20000"); // Default light cone as fallback
};

/**
 * Rarity colors for UI styling
 */
export const RARITY_COLORS = {
  3: "#4A90E2", // Blue
  4: "#A569BD", // Purple
  5: "#F39C12", // Gold
} as const;

/**
 * Get rarity color by rank type
 */
export const getRarityColor = (rankType: string | number): string => {
  const rank = typeof rankType === "string" ? parseInt(rankType) : rankType;
  return RARITY_COLORS[rank as keyof typeof RARITY_COLORS] || RARITY_COLORS[3];
};

/**
 * Check if an asset exists (for error handling)
 */
export const checkAssetExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get banner display color by banner type
 */
export const getBannerDisplayColor = (bannerType: string): string => {
  switch (bannerType) {
    case "11":
      return "#FF6B6B";
    case "12":
      return "#4ECDC4";
    case "1":
      return "#45B7D1";
    default:
      return "#95A5A6";
  }
};
