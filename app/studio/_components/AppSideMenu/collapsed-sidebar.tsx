import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import React from "react";
import { EnvironmentSettings } from "./environment-settings";
import MaterialSettings from "./material-settings";
import { PostprocessingSettings } from "./postprocessing-settings";

export const CollapsedSideBar = () => {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden border-b border-border text-xs transition-all duration-300 ease-in-out md:h-full md:border-l md:border-b-0",
      )}
    >
      <TabsContent
        value="material"
        className="h-full m-0 flex flex-col overflow-hidden"
      >
        <h3 className="mb-3 flex h-12 shrink-0 items-center border-b border-border px-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Material
        </h3>
        <MaterialSettings />
      </TabsContent>
      <TabsContent
        value="environment"
        className="h-full m-0 flex flex-col overflow-hidden"
      >
        <h3 className="mb-3 flex h-12 shrink-0 items-center border-b border-border px-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Environment
        </h3>
        <EnvironmentSettings />
      </TabsContent>
      <TabsContent
        value="postprocessing"
        className="h-full m-0 flex flex-col overflow-hidden"
      >
        <h3 className="mb-3 flex h-12 shrink-0 items-center border-b border-border px-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Post Processing
        </h3>
        <PostprocessingSettings />
      </TabsContent>
    </div>
  );
};
