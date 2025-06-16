"use client";
import { PanelRight } from "@/components/animate-ui/icons/panel-right";
import { AppSidebar } from "./_components/AppSideMenu/app-sidebar";
import { ViewerWrapper } from "./_components/Viewport";

import { useState } from "react";
import { LeftSideBar } from "./_components/AppSideMenu/left-sidebar";
import { RightSideBar } from "./_components/AppSideMenu/right-sidebar";

export default function Page() {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const toggleLeftPanel = () => setShowLeftPanel(!showLeftPanel);
  const toggleRightPanel = () => setShowRightPanel(!showRightPanel);

  return (
    <div className="relative flex flex-col md:flex-row h-screen  overflow-hidden">
      <div className="h-1/2 w-full md:h-full  flex-1 relative">
        <ViewerWrapper />
      </div>
      {/* <AppSidebar isOpen={isCollapsibleMenuOpen} /> */}
      <RightSideBar
        isVisible={showRightPanel}
        onPanelToggle={toggleRightPanel}
      />
      <LeftSideBar isVisible={showLeftPanel} onPanelToggle={toggleLeftPanel} />
    </div>
  );
}
