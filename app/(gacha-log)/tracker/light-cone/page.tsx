"use client";
import React, { useState, useEffect } from "react";
import { ImportButton, SummarySector } from "@/components/custom";
import { DataTable } from "@/components/custom/LogTable/data-table";
import { columns } from "@/components/custom/LogTable/columns";
import { Log } from "@/models/GachaLog";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import ScrollMenuComponent, {
  RecentModel,
} from "@/components/custom/ScrollMenu/scrollmenu";
import { standartLightCone } from "@/lib/constant";
import { SettingButton } from "@/components/custom/SettingButton/SettingButton";

interface Props {}

function TrackerLightCone(props: Props) {
  const { logs, setLogs } = useGachaLog();
  const [recentList, setRecentList] = useState<RecentModel[]>([]);

  function getWinData(original: Log[]) {
    var temp: RecentModel[] = [];
    const list = [...original].reverse();
    var diffrent: number = 0;
    for (var i = 0; i < list.length; i++) {
      let lightCone = list[i];
      diffrent = diffrent + 1;
      if (lightCone.rank_type === "5") {
        const isWin = !standartLightCone.includes(
          lightCone.name.toLocaleLowerCase()
        );
        temp.push({
          rolls: diffrent,
          isWin: isWin,
          data: lightCone,
        });
        diffrent = 0;
      }
    }
    return [...temp].reverse();
  }

  useEffect(() => {
    if (logs.lightCone) {
      setRecentList(getWinData(logs.lightCone));
    }
  }, [logs]);

  return (
    <div className="flex flex-col flex-grow  bg-white w-full ">
      <div className="flex flex-row justify-end px-[16px]">
        <ImportButton></ImportButton>
        <SettingButton></SettingButton>
      </div>{" "}
      <div className=" self-center">
        <h1>Light Cone Event warp</h1>
      </div>
      <SummarySector
        data={logs.lightCone}
        fiveStarList={recentList}
      ></SummarySector>
      <div className="size-[16px]"></div>
      <div className=" flex flex-col justify-center px-[16px] p-t-[32px] rounded-[10px]">
        <div className="self-center">Recent 5-Star</div>
        <ScrollMenuComponent list={recentList} />
      </div>
      <div className="size-[16px]"></div>
      <div>
        <DataTable columns={columns} data={logs.lightCone} />
      </div>
    </div>
  );
}

export default TrackerLightCone;
