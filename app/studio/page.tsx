"use client";
import { PanelRight } from "@/components/animate-ui/icons/panel-right";
import { AppSidebar } from "./_components/AppSideMenu/app-sidebar";
import { ViewerWrapper } from "./_components/Viewport";
import { Toolbar } from "./_components/Viewport/toolbar";

import { useState } from "react";

export default function Page() {
  const [isCollapsibleMenuOpen, setIsCollapsibleMenuOpen] = useState(true);

  return (
    <div className="flex flex-col md:flex-row h-screen  overflow-hidden">
      <div className="h-1/2 w-full md:h-full  flex-1 relative">
        <button
          className="hidden md:block md:absolute top-2 right-2 z-50  p-1 rounded"
          onClick={() => setIsCollapsibleMenuOpen(!isCollapsibleMenuOpen)}
        >
          <PanelRight animateOnHover className="w-4 h-4 cursor-pointer" />
        </button>
        <Toolbar />
        <ViewerWrapper sidebarIsOpen={isCollapsibleMenuOpen} />
      </div>
      <AppSidebar isOpen={isCollapsibleMenuOpen} />
    </div>
  );
}
