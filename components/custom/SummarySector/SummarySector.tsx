import { Log } from "@/models/GachaLog";
import * as React from "react";
import { useState, useEffect } from "react";
import { RecentModel } from "../ScrollMenu/scrollmenu";
import { BannerType } from "@/lib/constant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "../InfoTooltip/InfoTooltip";
import { Badge } from "@/components/ui/badge";
import { Gem, Sparkles, Star, ShieldCheck, TrendingUp } from "lucide-react";

interface IAppProps {
  data: Log[];
  fiveStarList?: RecentModel[];
  bannerType: BannerType;
}

const SummaryCard = ({
  title,
  value,
  percentage,
  tooltip,
}: {
  title: string;
  value: string;
  percentage?: string;
  tooltip: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <InfoTooltip tooltip={tooltip} title={title} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {percentage && <Badge className="mt-1">{percentage}%</Badge>}
    </CardContent>
  </Card>
);

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

  function getCountRollsSinceLast5Star(): number {
    for (var i: number = 0; i < props.data.length; i++) {
      if (props.data[i].rank_type === "5") {
        return i;
      }
    }
    return props.data.length;
  }

  const fiveStarCount = getCountByRanks("5");
  const fourStarCount = getCountByRanks("4");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SummaryCard
        title="Total Warps"
        value={formatter.format(props.data.length)}
        tooltip="The total number of warps made on this banner."
      />
      <SummaryCard
        title="Stellar Jade Spent"
        value={formatter.format(props.data.length * 160)}
        tooltip="Estimated Stellar Jade spent (160 per warp)."
      />
      <SummaryCard
        title="5-Star Items"
        value={String(fiveStarCount)}
        percentage={getPercentageByRanks("5")}
        tooltip="Total 5-star items obtained and their percentage rate."
      />
      {props.fiveStarList && props.bannerType !== BannerType.Standard && (
        <SummaryCard
          title="Limited 5-Star Wins"
          value={String(winCount)}
          percentage={
            props.fiveStarList.length > 0
              ? ((winCount / props.fiveStarList.length) * 100).toFixed(2)
              : "0.00"
          }
          tooltip="Number of times you won the featured 5-star item."
        />
      )}
      <SummaryCard
        title="4-Star Items"
        value={String(fourStarCount)}
        percentage={getPercentageByRanks("4")}
        tooltip="Total 4-star items obtained and their percentage rate."
      />
      <SummaryCard
        title="Rolls Since Last 5-Star"
        value={String(getCountRollsSinceLast5Star())}
        tooltip="The number of rolls made since the last 5-star item was obtained."
      />
    </div>
  );
};
