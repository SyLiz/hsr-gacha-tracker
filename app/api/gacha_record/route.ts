import { objectToUrlParams } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  var authkey = req.nextUrl.searchParams.get("authkey");
  var gachaType = req.nextUrl.searchParams.get("gacha_type");
  var endId = req.nextUrl.searchParams.get("end_id");
  var unix = Math.floor(Date.now() / 1000);

  var obj = {
    authkey_ver: 1,
    sign_type: 2,
    auth_appid: "webview_gacha",
    win_mode: "fullscreen",
    timestamp: unix,
    region: "prod_official_asia",
    gacha_type: gachaType,
    lang: "th",
    game_biz: "hkrpg_global",
    plat_type: "pc",
    size: 20,
    end_id: endId,
  } as any;

  // Determine endpoint based on gacha_type
  const endpoint =
    gachaType === "21" || gachaType === "22" ? "getLdGachaLog" : "getGachaLog";

  const res = await fetch(
    `${
      process.env.MIHOYO_URL
    }/common/gacha_record/api/${endpoint}?${objectToUrlParams(
      obj
    )}&authkey=${authkey}`
  );
  const result = await res.json();
  return NextResponse.json(result);
}
