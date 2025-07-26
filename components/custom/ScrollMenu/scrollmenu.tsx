import React from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import { LeftArrow, RightArrow } from "./components/arrow";
import { Log } from "@/models/GachaLog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;

function onWheel(apiObj: scrollVisibilityApiType, ev: React.WheelEvent): void {
  if (ev.deltaY < 0) {
    apiObj.scrollPrev();
  } else if (ev.deltaY > 0) {
    apiObj.scrollNext();
  }
}

export interface RecentModel {
  rolls: number;
  isWin: boolean;
  data: Log;
}

interface Props {
  list: RecentModel[];
}

export const ScrollMenuComponent: React.FC<Props> = (props) => {
  return props.list.length > 0 ? (
    <div className="select-none w-full max-w-full overflow-hidden">
      <ScrollMenu
        LeftArrow={LeftArrow}
        RightArrow={RightArrow}
        onWheel={onWheel}
        itemClassName="p-2"
        wrapperClassName="py-2 max-w-full"
        scrollContainerClassName="no-scrollbar max-w-full"
      >
        {props.list.map(({ isWin, data, rolls }, index) => (
          <ItemCard key={index} isWin={isWin} data={data} rolls={rolls} />
        ))}
      </ScrollMenu>
    </div>
  ) : (
    <div className="text-center text-muted-foreground py-8">
      No 5-star items to display yet.
    </div>
  );
};

const ItemCard = ({
  isWin,
  data,
  rolls,
}: {
  isWin: boolean;
  data: Log;
  rolls: number;
}) => {
  let rollColorClass = "";

  if (rolls <= 25) {
    rollColorClass = "text-green-500";
  } else if (rolls > 25 && rolls <= 50) {
    rollColorClass = "text-yellow-500";
  } else if (rolls > 50 && rolls <= 75) {
    rollColorClass = "text-orange-500";
  } else {
    rollColorClass = "text-red-500";
  }

  return (
    <Card className="w-48 text-center">
      <CardContent className="p-2">
        <CardTitle className="text-base font-semibold truncate pt-4">
          {data.name}
        </CardTitle>
        <p className={`text-lg font-bold ${rollColorClass}`}>{rolls} rolls</p>
      </CardContent>
      <CardFooter className="p-2">
        <Badge variant={isWin ? "default" : "destructive"} className="w-full">
          {isWin ? "Won" : "Lost"}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ScrollMenuComponent;
