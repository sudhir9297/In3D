"use client";
import * as React from "react";
import { CollapsedSideBar } from "./collapsed-sidebar";
import { IconSidebar } from "./icon-sidebar";
import { Tabs } from "@/components/ui/tabs";

export function AppSidebar() {
  return (
    <Tabs
      defaultValue="scenegraph"
      className="overflow-hidden  w-full h-1/2 md:h-full flex flex-col md:flex-row justify-between  md:border-l "
    >
      <IconSidebar />
      <CollapsedSideBar />
    </Tabs>
  );
}
