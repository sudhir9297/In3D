import { PanelRight } from "@/components/animate-ui/icons/panel-right";
import React from "react";

export const RightSideBar = ({
  isVisible,
  onPanelToggle,
}: {
  isVisible: boolean;
  onPanelToggle: () => void;
}) => {
  return (
    <div
      className="absolute right-0 top-0 z-50 h-full py-2 pr-2 transition-all duration-300"
      style={{
        transform: `translateX(${isVisible ? "0" : "98%"})`,
        width: "300px",
      }}
    >
      <PanelRight
        size={20}
        strokeWidth={1.5}
        animateOnHover
        className="absolute -left-8  top-5 cursor-pointer"
        onClick={onPanelToggle}
      />
      <div
        className="relative h-full overflow-hidden rounded-xl border  text-xs "
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? "visible" : "hidden",
        }}
      >
        Right Sidebar
      </div>
    </div>
  );
};
