"use client";

import { LeftSideBar } from "./_components/AppSideMenu/left-sidebar";
import { Toolbar } from "./_components/Viewport/toolbar";
import { ViewerWrapper } from "./_components/Viewport";

export function StudioShell() {
  return (
    <div className="studio-app relative h-screen overflow-hidden text-[#161514]">
      <main className="absolute left-0 right-0 top-0 bottom-0">
        <div className="absolute inset-y-0 left-0 right-0 top-0 md:left-[300px]">
          <div className="relative h-full w-full overflow-hidden bg-[#ece9e1]">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.48),transparent_24%),linear-gradient(to_right,rgba(0,0,0,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.018)_1px,transparent_1px)] bg-[size:100%_100%,32px_32px,32px_32px]" />
            <div className="relative h-full w-full">
              <ViewerWrapper />
            </div>
            <Toolbar />
          </div>
        </div>
      </main>

      <LeftSideBar />
    </div>
  );
}
