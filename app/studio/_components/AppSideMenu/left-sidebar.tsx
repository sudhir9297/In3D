import React from "react";
import { Toolbar } from "../Viewport/toolbar";
import { PanelLeft } from "@/components/animate-ui/icons/panel-left";

export const LeftSideBar = ({
  isVisible,
  onPanelToggle,
}: {
  isVisible: boolean;
  onPanelToggle: () => void;
}) => {
  return (
    <div
      className="absolute left-0 top-0 z-50 h-full py-2 pl-2 transition-all duration-300"
      style={{
        transform: `translateX(${isVisible ? "0" : "-98%"})`,
        width: "300px",
      }}
    >
      <PanelLeft
        size={20}
        strokeWidth={1.5}
        animateOnHover
        className="absolute -right-8 top-5 cursor-pointer"
        onClick={onPanelToggle}
      />
      <Toolbar />
      <div
        className="relative h-full overflow-hidden rounded-xl border bg-white text-xs "
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? "visible" : "hidden",
        }}
      >
        Left Sidebar
      </div>
    </div>
  );
};
