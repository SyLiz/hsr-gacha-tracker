import { Log } from "@/models/GachaLog";
import * as React from "react";
import { useState, useEffect } from "react";
import { RecentModel } from "../ScrollMenu/scrollmenu";
import { BannerType } from "@/lib/constant";

interface IAppProps {
  data: Log[];
  fiveStarList?: RecentModel[];
  bannerType: BannerType;
}

export const SummarySector: React.FC<IAppProps> = (props) => {
  const [winCount, setWinCount] = useState<number>(0);
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });
  useEffect(() => {
    if (props.fiveStarList) {
      var c = 0;
      props.fiveStarList.forEach((item) => {
        if (item.isWin) c++;
      });
      setWinCount(c);
    }
  }, [props.fiveStarList]);

  function getCountByRanks(ranks: string): number {
    return props.data.filter((item) => item.rank_type === ranks).length;
  }

  function getPercentageByRanks(ranks: string): string {
    if (props.data.length === 0) return "0.00";
    return formatter.format((getCountByRanks(ranks) / props.data.length) * 100);
  }

  function getCountUntilSoftPity(): number | undefined {
    for (var i: number = 0; i < props.data.length; i++) {
      if (props.data[i].rank_type === "5" || i === props.data.length) {
        let softPity =
          props.bannerType === BannerType.Character ||
          props.bannerType === BannerType.Standard
            ? 75
            : 65;
        return softPity - i;
      }
    }
    return undefined;
  }

  return (
    <div>
      <div className="px-[24px] flex justify-center pl-[128px] ">
        <table className="table-auto w-full max-w-[720px]">
          <tbody>
            <tr>
              <td>Total warp</td>
              <td className=" text-right">
                {formatter.format(props.data.length)}
              </td>
            </tr>
            <tr>
              <td>Jade spend</td>
              <td className=" text-right">
                {formatter.format(props.data.length * 160)}
              </td>
            </tr>
            <tr>
              <td>5* </td>
              <td className=" text-right">{`${getCountByRanks("5")}`}</td>
              <td className="text-left pl-4 w-[128px]">
                {getPercentageByRanks("5")}%
              </td>
            </tr>
            {winCount && props.fiveStarList ? (
              <tr>
                <td>5* (Limited) </td>
                <td className=" text-right">{`${winCount}`}</td>
                <td className=" text-left pl-4 w-[128px]">
                  {((winCount / props.fiveStarList.length) * 100).toFixed(2)}%
                </td>
              </tr>
            ) : (
              <tr>
                <td className=" "></td>
                <td className=" text-right"></td>
              </tr>
            )}
            <tr>
              <td>4* </td>
              <td className=" text-right">{`${getCountByRanks("4")} `}</td>
              <td className="text-left pl-4 w-[128px]">
                {getPercentageByRanks("4")}%
              </td>
            </tr>
            <tr>
              <td>Until soft pity</td>
              <td className=" text-right">{`${getCountUntilSoftPity()} `}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
