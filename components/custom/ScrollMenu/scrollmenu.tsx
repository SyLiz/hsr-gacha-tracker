import { DragDealer } from "@/lib/DragDealer";
import React from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;

const getItems = () =>
  Array(100)
    .fill(0)
    .map((_, ind) => ({ id: `element-${ind}` }));

function ScrollMenuComponent() {
  const [items, setItems] = React.useState(getItems);

  return (
    <div>
      <ScrollMenu
        // LeftArrow={LeftArrow}
        // RightArrow={RightArrow}
        itemClassName="p-[8px]"
        wrapperClassName="py-[8px]"
        scrollContainerClassName="no-scrollbar"
      >
        {items.map(({ id }, index) => (
          <div
            className={`rounded-[48px] bg-white size-[48px] flex justify-center`}
            id={id}
            title={id}
            key={id}
          >
            <div className=" self-center">{index}</div>
          </div>
        ))}
      </ScrollMenu>
    </div>
  );
}

export default ScrollMenuComponent;
