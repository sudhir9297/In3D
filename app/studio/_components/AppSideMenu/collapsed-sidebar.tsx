import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import SceneGraph from "./scene-graph";

export const RightSideBar = ({ isOpen }: { isOpen: boolean }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (isOpen) {
      menu.style.width = "240px";
      menu.style.minWidth = "240px";
      menu.style.visibility = "visible";
    } else {
      menu.style.width = "0";
      menu.style.minWidth = "0";

      const timer = setTimeout(() => {
        if (!isOpen) {
          menu.style.visibility = "hidden";
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div
      className={cn(
        "relative border-b md:border-l md:h-full h-full w-full md:py-3 px-1 text-xs",
        isOpen ? "block" : "hidden"
      )}
    >
      <TabsContent
        value="scenegraph"
        className="h-full pb-10 md:pb-6 overflow-auto "
      >
        <SceneGraph />
      </TabsContent>
      <TabsContent value="assets">
        <h3 className="font-medium mb-2">Assets Settings</h3>
        <p>Design settings and options will appear here.</p>
      </TabsContent>
      <TabsContent value="material">
        <h3 className="font-medium mb-2">Material Settings</h3>
        <p>Design settings and options will appear here.</p>
      </TabsContent>
      <TabsContent value="environment">
        <h3 className="font-medium mb-2">Environment Settings</h3>
        <p>Design settings and options will appear here.</p>
      </TabsContent>
      <TabsContent value="postprocessing">
        <h3 className="font-medium mb-2">Postprocessing Settings</h3>
        <p>Design settings and options will appear here.</p>
      </TabsContent>
    </div>
  );
};
