import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

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
        "border-b md:border-l md:h-full flex-1",
        isOpen ? "block" : "hidden"
      )}
    >
      <div className="p-4 text-xs">
        <TabsContent value="outline">
          <h3 className="font-medium mb-2">Outline Settings</h3>
          <p>Design settings and options will appear here.</p>
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
    </div>
  );
};
