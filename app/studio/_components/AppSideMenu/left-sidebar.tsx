import React from "react";
import { Toolbar } from "../Viewport/toolbar";
import { PanelLeft } from "@/components/animate-ui/icons/panel-left";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/radix/tabs";
import SceneGraph from "./scene-graph";

const LogoHeader = () => {
  return (
    <div className="p-2">
      <img src="/logo.svg" alt="logo" className="h-10 w-10" />
    </div>
  );
};

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
        className="relative h-full overflow-hidden rounded-xl border bg-card text-xs"
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? "visible" : "hidden",
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex-none">
            <LogoHeader />
            <Separator />
          </div>
          <Tabs
            defaultValue="scene"
            className="flex h-[calc(100%-64px)] flex-col"
          >
            <div className="flex-none px-2 pt-2">
              <TabsList>
                <TabsTrigger value="scene" className="w-full">
                  Scene
                </TabsTrigger>
                <TabsTrigger value="assets" className="w-full">
                  Assets
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <TabsContent
              value="scene"
              className="flex-1 overflow-y-auto min-h-0"
            >
              <SceneGraph />
            </TabsContent>
            <TabsContent
              value="assets"
              className="flex-1 overflow-y-auto min-h-0 p-2"
            >
              assets
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
