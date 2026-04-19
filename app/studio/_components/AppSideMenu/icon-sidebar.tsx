import type React from "react";
import {
  BrushIcon,
  ColorsIcon,
  FlowCircleIcon,
  Leaf01Icon,
} from "@hugeicons/core-free-icons";

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
import { Icon } from "@/components/ui/huge-icon";

const mainIcons = [
  { icon: FlowCircleIcon, label: "Outline", value: "outline" },
  { icon: BrushIcon, label: "Material", value: "material" },
  { icon: Leaf01Icon, label: "Environment", value: "environment" },
  { icon: ColorsIcon, label: "Post Processing", value: "postprocessing" },
];

export const IconSidebar = () => {
  return (
    <TooltipProvider openDelay={400}>
      <div className="flex h-11 w-full border-b border-border bg-card md:h-full md:w-12 md:flex-col">
        <Carousel className="md:hidden" arrow>
          <TabsList className="h-11 rounded-none bg-transparent p-0">
            <CarouselContent className="gap-2">
              {mainIcons.map((item) => (
                <CarouselItem key={item.label}>
                  <IconButton
                    icon={<Icon icon={item.icon} className="h-4 w-4" />}
                    label={item.label}
                    value={item.value}
                  />
                </CarouselItem>
              ))}
              <CarouselItem key="theme-toggle">
                <ThemeToggle className="md:border-b" />
              </CarouselItem>
            </CarouselContent>
          </TabsList>
        </Carousel>
        <div className="hidden h-full flex-1 flex-col md:flex">
          <TabsList className="flex-1 items-center gap-0 rounded-none bg-transparent p-0 md:flex md:flex-col">
            {mainIcons.map((item) => (
              <IconButton
                key={item.label}
                icon={<Icon icon={item.icon} className="h-4 w-4" />}
                label={item.label}
                value={item.value}
              />
            ))}
          </TabsList>
          <div className="mt-auto">
            <ThemeToggle className="shrink-0 border-t border-b-0" />
          </div>
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
        <div className="w-full">
          <TabsTrigger
            value={value}
            className="flex h-12 w-full items-center justify-center rounded-none border-b border-border px-2 text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:border-b md:border-r-0"
          >
            <div className="flex h-7 w-7 items-center justify-center">
              {icon}
              <span className="sr-only">{label}</span>
            </div>
            <span className="md:hidden text-[10px] uppercase tracking-[0.22em]">
              {label}
            </span>
          </TabsTrigger>
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
