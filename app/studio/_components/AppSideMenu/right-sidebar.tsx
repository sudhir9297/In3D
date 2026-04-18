import { PanelRight } from "@/components/animate-ui/icons/panel-right";
import { Tabs } from "@/components/ui/tabs";
import React from "react";
import { IconSidebar } from "./icon-sidebar";
import { CollapsedSideBar } from "./collapsed-sidebar";

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
        transform: `translateX(${isVisible ? "0" : "100%"})`,
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
        className="relative h-full bg-card overflow-hidden rounded-xl border  text-xs transition-all duration-300 "
        // style={{
        //   opacity: isVisible ? 1 : 0,
        //   visibility: isVisible ? "visible" : "hidden",
        // }}
      >
        <Tabs
          defaultValue="material"
          className="overflow-hidden  w-full h-1/2 md:h-full flex flex-col md:flex-row justify-between "
        >
          <IconSidebar />
          <CollapsedSideBar />
        </Tabs>
      </div>
    </div>
  );
};
