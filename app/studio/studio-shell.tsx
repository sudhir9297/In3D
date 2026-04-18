"use client";

import { useState } from "react";

import { LeftSideBar } from "./_components/AppSideMenu/left-sidebar";
import { RightSideBar } from "./_components/AppSideMenu/right-sidebar";
import { ViewerWrapper } from "./_components/Viewport";

export function StudioShell() {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const toggleLeftPanel = () => setShowLeftPanel((value) => !value);
  const toggleRightPanel = () => setShowRightPanel((value) => !value);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden md:flex-row">
      <div className="relative h-1/2 w-full flex-1 md:h-full">
        <ViewerWrapper />
      </div>
      <RightSideBar
        isVisible={showRightPanel}
        onPanelToggle={toggleRightPanel}
      />
      <LeftSideBar isVisible={showLeftPanel} onPanelToggle={toggleLeftPanel} />
    </div>
  );
}
