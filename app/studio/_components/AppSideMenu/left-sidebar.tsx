import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { IconSidebar } from "./icon-sidebar";
import { CollapsedSideBar } from "./collapsed-sidebar";

const LogoHeader = () => {
  return (
    <div className="border-b border-border px-4 py-3">
      <div className="text-[2.2rem] font-black leading-none tracking-[-0.08em] text-foreground">
        In3D Viewer
      </div>
    </div>
  );
};

export const LeftSideBar = () => {
  return (
    <div className="absolute left-0 top-0 z-50 h-full w-[300px]">
      <div className="studio-panel relative h-full overflow-hidden rounded-none text-xs">
        <div className="flex h-full flex-col">
          <div className="flex-none">
            <LogoHeader />
          </div>
          <Tabs
            defaultValue="material"
            className="flex h-[calc(100%-88px)] flex-col overflow-hidden md:flex-row"
          >
            <IconSidebar />
            <CollapsedSideBar />
          </Tabs>
        </div>
      </div>
    </div>
  );
};
