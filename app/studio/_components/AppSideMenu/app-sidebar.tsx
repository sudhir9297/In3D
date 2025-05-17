"use client";
import * as React from "react";
import { RightSideBar } from "./collapsed-sidebar";
import { IconSidebar } from "./icon-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AppSidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <Tabs
      defaultValue="outline"
      className="overflow-hidden w-full h-1/2 md:h-full flex flex-col md:flex-row justify-between  md:border-l "
    >
      <IconSidebar />
      <RightSideBar isOpen={isOpen} />
    </Tabs>
  );
}
