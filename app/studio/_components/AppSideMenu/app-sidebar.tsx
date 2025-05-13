"use client";
import * as React from "react";
import { RightSideBar } from "./collapsed-sidebar";
import { IconSidebar } from "./icon-sidebar";

export function AppSidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="overflow-hidden h-1/2 md:h-full flex flex-col md:flex-row justify-between  md:border-l">
      <IconSidebar />
      <RightSideBar isOpen={isOpen} />
    </div>
  );
}
