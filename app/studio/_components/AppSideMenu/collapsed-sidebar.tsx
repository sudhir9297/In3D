import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import React from "react";

export const CollapsedSideBar = () => {
  return (
    <div
      className={cn(
        "relative border-b md:border-l md:h-full h-full w-full md:py-3 px-1 text-xs transition-all duration-300 ease-in-out"
      )}
    >
      <TabsContent value="material">
        <h3 className="font-medium text-sm px-3 mb-2">Material Settings</h3>
        <p>Design settings and options will appear here.</p>
      </TabsContent>
      <TabsContent value="environment">
        <h3 className="font-medium text-sm px-3 mb-2">Environment Settings</h3>
        <p>Design settings and options will appear here.</p>
      </TabsContent>
      <TabsContent value="postprocessing">
        <h3 className="font-medium text-sm px-3 mb-2">
          Postprocessing Settings
        </h3>
        <p>Design settings and options will appear here.</p>
      </TabsContent>
    </div>
  );
};
