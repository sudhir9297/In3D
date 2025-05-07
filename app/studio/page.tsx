"use client";
import { AppSidebar } from "./_components/AppSideMenu/app-sidebar";
import { ViewerWrapper } from "./_components/viewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useResponsiveLayout } from "./hooks/useResponsiveLayout";

export default function Page() {
  const { isMobile } = useResponsiveLayout();

  const panelConfig = {
    main: {
      defaultSize: isMobile ? 60 : 80,
      minSize: isMobile ? 50 : 75,
      maxSize: isMobile ? 60 : 80,
    },
    sidebar: {
      defaultSize: 20,
    },
  };

  return (
    <ResizablePanelGroup
      direction={isMobile ? "vertical" : "horizontal"}
      className="w-full min-h-screen"
    >
      <ResizablePanel
        defaultSize={panelConfig.main.defaultSize}
        minSize={panelConfig.main.minSize}
        maxSize={panelConfig.main.maxSize}
      >
        <ViewerWrapper />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={panelConfig.sidebar.defaultSize}>
        <AppSidebar />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
