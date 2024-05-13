import { Button } from "@/components/ui/button";
import React from "react";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";

import {
  VisibilityContext,
  publicApiType,
} from "react-horizontal-scrolling-menu";

export function LeftArrow() {
  const visibility = React.useContext<publicApiType>(VisibilityContext);
  const isFirstItemVisible = visibility.useIsVisible("first", true);

  return (
    <Arrow
      disabled={isFirstItemVisible}
      onClick={() => visibility.scrollPrev()}
    >
      <SlArrowLeft />
    </Arrow>
  );
}

export function RightArrow() {
  const visibility = React.useContext<publicApiType>(VisibilityContext);
  const isLastItemVisible = visibility.useIsVisible("last", false);

  return (
    <Arrow disabled={isLastItemVisible} onClick={() => visibility.scrollNext()}>
      <SlArrowRight />
    </Arrow>
  );
}

function Arrow({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: VoidFunction;
}) {
  return (
    <Button
      variant={"ghost"}
      className="h-full "
      size={"sm"}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
