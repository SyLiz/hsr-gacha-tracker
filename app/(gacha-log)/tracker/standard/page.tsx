"use client";
import React, { useState, useEffect } from "react";
import { ImportButton, SummarySector } from "@/components/custom";
import { DataTable } from "@/components/custom/LogTable/data-table";
import { columns } from "@/components/custom/LogTable/columns";
import { Log } from "@/models/GachaLog";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import { SettingButton } from "@/components/custom/SettingButton/SettingButton";
import { BannerType } from "@/lib/constant";

interface Props {}

function TrackerStandard(props: Props) {
  const { logs, setLogs } = useGachaLog();

  return (
    <div className="flex flex-col flex-grow  bg-white w-full ">
      <div className="flex flex-row justify-end px-[16px]">
        <ImportButton></ImportButton>
        <SettingButton></SettingButton>
      </div>
      <div className=" self-center">
        <h1>Standdard Event warp</h1>
      </div>
      <SummarySector
        data={logs.standard}
        bannerType={BannerType.LightCone}
      ></SummarySector>
      <div className="size-[16px]"></div>
      {/* <div className=" flex flex-col justify-center bg-red-100 p-t-[32px] rounded-[10px]">
        <div className=" self-center">Recent 5* warp</div>
        <ScrollMenuComponent />
      </div>
      <div className="size-[16px]"></div> */}
      <div>
        <DataTable columns={columns} data={logs.standard} />
      </div>
    </div>
  );
}

export default TrackerStandard;
