import type React from "react";
import { Box, ListTree, TentTree, SwatchBook, Blend } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const mainIcons = [
  { icon: ListTree, label: "Outline" },
  { icon: SwatchBook, label: "Assets" },
  { icon: Box, label: "Material" },
  { icon: TentTree, label: "Environment" },
  { icon: Blend, label: "Post Processing" },
];

export const IconSidebar = () => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full md:h-screen md:w-10  h-10 border-b flex md:flex-col bg-background  ">
        <Carousel className="md:hidden" arrow>
          <CarouselContent className="gap-2">
            {mainIcons.map((item) => (
              <CarouselItem key={item.label}>
                <IconButton
                  icon={<item.icon className="h-3.5 w-3.5" />}
                  label={item.label}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="p-2  md:flex md:flex-col flex-1 items-center gap-4 hidden ">
          {mainIcons.map((item) => (
            <IconButton
              key={item.label}
              icon={<item.icon className="h-3.5 w-3.5" />}
              label={item.label}
            />
          ))}
        </div>
        <div className="hidden md:flex mt-auto p-2  flex-col items-center gap-4 ">
          <ThemeToggle />
        </div>
      </div>
    </TooltipProvider>
  );
};

function IconButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-center px-2 md:px-0">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            {icon}
            <span className="sr-only">{label}</span>
          </Button>
          <span className="md:hidden text-sm">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs hidden md:block">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
