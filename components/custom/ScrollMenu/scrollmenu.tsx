import { DragDealer } from "@/lib/DragDealer";
import React from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import { LeftArrow, RightArrow } from "./components/arrow";
import { Log } from "@/models/GachaLog";
import { Badge } from "@/components/ui/badge";

const preventDefault = (ev: Event) => {
  if (ev.preventDefault) {
    ev.preventDefault();
  }

  ev.returnValue = false;
};

const enableBodyScroll = () => {
  document && document.removeEventListener("wheel", preventDefault, false);
};
const disableBodyScroll = () => {
  document &&
    document.addEventListener("wheel", preventDefault, {
      passive: false,
    });
};

export function usePreventBodyScroll() {
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    hidden ? disableBodyScroll() : enableBodyScroll();

    return enableBodyScroll;
  }, [hidden]);

  const disableScroll = React.useCallback(() => setHidden(true), []);
  const enableScroll = React.useCallback(() => setHidden(false), []);
  return { disableScroll, enableScroll };
}

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;

function onWheel(apiObj: scrollVisibilityApiType, ev: React.WheelEvent): void {
  const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15;

  if (isThouchpad) {
    ev.stopPropagation();
    return;
  }

  if (ev.deltaY > 0) {
    apiObj.scrollNext();
  } else if (ev.deltaY < 0) {
    apiObj.scrollPrev();
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
  const { disableScroll, enableScroll } = usePreventBodyScroll();

  // NOTE: for drag by mouse
  const dragState = React.useRef(new DragDealer());

  const handleDrag =
    ({ scrollContainer }: scrollVisibilityApiType) =>
    (ev: React.MouseEvent) =>
      dragState.current.dragMove(ev, (posDiff: number) => {
        if (scrollContainer.current) {
          scrollContainer.current.scrollLeft += posDiff;
        }
      });

  return props.list.length > 0 ? (
    <div
      onMouseEnter={disableScroll}
      onMouseLeave={dragState.current.dragStop}
      className=" select-none	"
    >
      <ScrollMenu
        LeftArrow={LeftArrow}
        RightArrow={RightArrow}
        onWheel={onWheel}
        itemClassName=" p-[8px] flex justify-center"
        wrapperClassName="py-[8px]  "
        scrollContainerClassName="no-scrollbar"
        onMouseDown={() => dragState.current.dragStart}
        onMouseUp={() => dragState.current.dragStop}
        onMouseMove={handleDrag}
      >
        {props.list.map(({ isWin, data, rolls }, index) => (
          <TextComponent
            key={index}
            value={{ isWin, data, rolls }}
          ></TextComponent>
        ))}
      </ScrollMenu>
    </div>
  ) : (
    <></>
  );
};

export default ScrollMenuComponent;

const TextComponent = ({ value }: { value: RecentModel }) => {
  let colorClass = "";

  // Determine color class based on value range
  if (value.rolls <= 25) {
    colorClass = "text-green-500"; // Green
  } else if (value.rolls > 25 && value.rolls <= 45) {
    colorClass = "text-yellow-500"; // Yellow
  } else if (value.rolls > 45 && value.rolls <= 65) {
    colorClass = "text-orange-500"; // Orange
  } else if (value.rolls > 65) {
    colorClass = "text-red-500"; // Red
  }

  return (
    <Badge
      variant="outline"
      className={`  whitespace-nowrap p-[8px] ${
        value.isWin ? "border-[2px] border-lime-500" : ""
      }`}
    >
      <div>{`${value.data.name}`}</div>
      <div className=" w-[2px]"></div>
      <div className={`${colorClass}`}>{` ${value.rolls}`}</div>
    </Badge>
  );
};
