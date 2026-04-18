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
      className="absolute right-0 top-12 z-50 h-[calc(100%-3rem)] transition-all duration-300"
      style={{
        transform: `translateX(${isVisible ? "0" : "100%"})`,
        width: "320px",
      }}
    >
      <PanelRight
        size={20}
        strokeWidth={1.5}
        animateOnHover
        className="absolute -left-9 top-3 cursor-pointer rounded-none border border-border bg-card p-1 text-muted-foreground"
        onClick={onPanelToggle}
      />
      <div
        className="studio-panel relative h-full overflow-hidden rounded-none text-xs transition-all duration-300"
      >
        <Tabs
          defaultValue="material"
          className="flex h-1/2 w-full flex-col justify-between overflow-hidden md:h-full md:flex-row"
        >
          <IconSidebar />
          <CollapsedSideBar />
        </Tabs>
      </div>
    </div>
  );
};
