"use client";
import * as React from "react";
import RightSideBar from "./right-sidebar";
import LeftSideBar from "./left-sidebar";

export function AppSidebar({ ...props }) {
  return (
    <div
      className="overflow-hidden h-full flex flex-col-reverse md:flex-row justify-between"
      {...props}
    >
      <LeftSideBar />
      <RightSideBar />
    </div>
  );
}
