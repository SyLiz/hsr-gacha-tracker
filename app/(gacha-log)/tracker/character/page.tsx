"use client";
import React, { useEffect, useState } from "react";
import { ImportButton, SummarySector } from "@/components/custom";
import { DataTable } from "@/components/custom/LogTable/data-table";
import { columns } from "@/components/custom/LogTable/columns";
import { Log } from "@/models/GachaLog";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import ScrollMenuComponent, {
  RecentModel,
} from "@/components/custom/ScrollMenu/scrollmenu";
import { BannerType, standartCharacters } from "@/lib/constant";
import { SettingButton } from "@/components/custom/SettingButton/SettingButton";
interface Props {}

function TrackerCharacter(props: Props) {
  const { logs, setLogs } = useGachaLog();
  const [recentList, setRecentList] = useState<RecentModel[]>([]);

  function getWinData(original: Log[]) {
    var temp: RecentModel[] = [];

    const list = [...original].reverse();
    var diffrent: number = 0;
    for (var i = 0; i < list.length; i++) {
      let character = list[i];
      diffrent = diffrent + 1;
      if (character.rank_type === "5") {
        const isWin = !standartCharacters.includes(
          character.name.toLocaleLowerCase()
        );
        temp.push({
          rolls: diffrent,
          isWin: isWin,
          data: character,
        });
        diffrent = 0;
      }
    }
    return [...temp].reverse();
  }

  useEffect(() => {
    if (logs.character) {
      setRecentList(getWinData(logs.character));
    }
  }, [logs]);

  return (
    <div className="flex flex-col flex-grow  bg-white w-full ">
      <div className="flex flex-row justify-end px-[16px]">
        <ImportButton></ImportButton>
        <SettingButton></SettingButton>
      </div>
      <div className=" self-center">
        <h1>Character Event warp</h1>
      </div>
      <SummarySector
        data={logs.character}
        fiveStarList={recentList}
        bannerType={BannerType.Character}
      ></SummarySector>
      <div className="size-[16px]"></div>
      <div className=" flex flex-col justify-center px-[16px] p-t-[32px] rounded-[10px]">
        <div className=" self-center">Recent 5-Star</div>
        <ScrollMenuComponent list={recentList} />
      </div>
      <div className="size-[16px]"></div>
      <div>
        <DataTable columns={columns} data={logs.character} />
      </div>
    </div>
  );
}

export default TrackerCharacter;
