import { Log } from "@/models/GachaLog";
import * as React from "react";

interface IAppProps {
  data: Log[];
}

export const SummarySector: React.FC<IAppProps> = (props) => {
  function getCountByRanks(ranks: string): number {
    return props.data.filter((item) => item.rank_type === ranks).length;
  }

  function getPercentageByRanks(ranks: string): string {
    if (props.data.length === 0) return "0.00%";
    return `${((getCountByRanks(ranks) / props.data.length) * 100).toFixed(
      2
    )}%`;
  }

  return (
    <div>
      <div className="px-[24px] flex justify-center ">
        <table className="table-auto  w-full max-w-[480px]">
          <tbody>
            <tr>
              <td>Total warp</td>
              <td className=" text-right">{`${props.data.length}`}</td>
            </tr>
            <tr>
              <td>Jade spend</td>
              <td className=" text-right">{`${props.data.length * 160}`}</td>
            </tr>
            <tr>
              <td>5* warp</td>
              <td className=" text-right">{`${getCountByRanks(
                "5"
              )} (${getPercentageByRanks("5")})`}</td>
            </tr>
            <tr>
              <td>4* warp</td>
              <td className=" text-right">{`${getCountByRanks(
                "4"
              )} (${getPercentageByRanks("4")})`}</td>
            </tr>
            {/* <tr>
              <td>50/50 Win rate</td>
              <td className=" text-right">100%</td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  );
};