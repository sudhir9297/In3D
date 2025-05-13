import type React from "react";
import { Home, Layers, Triangle, Square, Box, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";

const mainIcons = [
  { icon: Home, label: "Home" },
  { icon: Layers, label: "Layers" },
  { icon: Triangle, label: "Triangle" },
  { icon: Square, label: "Square" },
  { icon: Box, label: "Box" },
  { icon: Circle, label: "Circle" },
];

export const IconSidebar = () => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full md:h-screen md:w-10  h-10 border-b flex md:flex-col bg-background  ">
        <div className="p-2  flex md:flex-col flex-1 items-center gap-4 ">
          {mainIcons.map((item) => (
            <IconButton
              key={item.label}
              icon={<item.icon className="h-3.5 w-3.5" />}
              label={item.label}
            />
          ))}
        </div>
        <div className="mt-auto p-2  flex flex-col items-center gap-4 ">
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
        <Button variant="ghost" size="icon" className="h-7 w-7">
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
