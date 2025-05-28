import { Camera } from "lucide-react";
import { Move3D } from "lucide-react";
import { MousePointerClick } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Toolbar = () => {
  const tools = [
    { icon: MousePointerClick, label: "Select" },
    { icon: Move3D, label: "Move" },
    { icon: Camera, label: "Screenshot" },
  ];

  return (
    <div className="absolute z-50 left-4 top-10 border rounded bg-background shadow-md">
      <TooltipProvider>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Tooltip key={tool.label}>
              <TooltipTrigger asChild>
                <button
                  className={
                    "w-10 h-10 flex items-center justify-center transition-colors  cursor-pointer  last:border-none border-b"
                  }
                  aria-label={tool.label}
                  title={tool.label}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
};
