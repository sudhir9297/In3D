import type React from "react";
import { Box, TentTree, Blend } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip";

const mainIcons = [
  { icon: Box, label: "Material", value: "material" },
  { icon: TentTree, label: "Environment", value: "environment" },
  { icon: Blend, label: "Post Processing", value: "postprocessing" },
];

export const IconSidebar = () => {
  return (
    <TooltipProvider openDelay={400}>
      <div className="w-full md:h-screen md:w-10 h-10 border-b flex md:flex-col bg-background   ">
        <Carousel className="md:hidden " arrow>
          <TabsList>
            <CarouselContent className="gap-2">
              {mainIcons.map((item) => (
                <CarouselItem key={item.label}>
                  <IconButton
                    icon={<item.icon className="h-4 w-4" />}
                    label={item.label}
                    value={item.value}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </TabsList>
        </Carousel>
        <TabsList className="p-2  md:flex md:flex-col flex-1 items-center gap-2 hidden ">
          {mainIcons.map((item) => (
            <IconButton
              key={item.label}
              icon={<item.icon className="h-4 w-4" />}
              label={item.label}
              value={item.value}
            />
          ))}
        </TabsList>

        <div className="hidden md:flex mt-auto p-2  flex-col items-center gap-4 ">
          <ThemeToggle />
        </div>
      </div>
    </TooltipProvider>
  );
};

function IconButton({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Tooltip side="left">
      <TooltipTrigger>
        <div>
          <TabsTrigger
            value={value}
            className="flex items-center justify-center data-[state=active]:text-chart-2 dark:data-[state=active]:text-chart-2 cursor-pointer"
          >
            <div className="h-7 w-7 flex items-center justify-center">
              {icon}
              <span className="sr-only">{label}</span>
            </div>
            <span className="md:hidden text-sm">{label}</span>
          </TabsTrigger>{" "}
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
