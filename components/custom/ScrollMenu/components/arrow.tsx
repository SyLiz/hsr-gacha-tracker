import { Button } from "@/components/ui/button";
import React from "react";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";

import { VisibilityContext } from "react-horizontal-scrolling-menu";

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

export function LeftArrow() {
  const { isFirstItemVisible, scrollPrev } =
    React.useContext(VisibilityContext);

  return (
    <Arrow disabled={isFirstItemVisible} onClick={() => scrollPrev()}>
      <SlArrowLeft />
    </Arrow>
  );
}

export function RightArrow() {
  const { isLastItemVisible, scrollNext } = React.useContext(VisibilityContext);

  return (
    <Arrow disabled={isLastItemVisible} onClick={() => scrollNext()}>
      <SlArrowRight />
    </Arrow>
  );
}
