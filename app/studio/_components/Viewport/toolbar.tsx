import { Camera, Grid3X3 } from "lucide-react";
import { Move3D } from "lucide-react";
import { MousePointerClick } from "lucide-react";

import { useViewportStore } from "../../store/viewportStore";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/animate-ui/base/toggle-group";

export const Toolbar = () => {
  const { showGrid, isEditorMode, toggleGrid, toggleEditorMode } =
    useViewportStore();

  const tools = [
    {
      icon: <MousePointerClick className="w-5 h-5" strokeWidth={1.5} />,
      label: "Select",
      handleClick: () => toggleEditorMode(false),
      isActive: !isEditorMode,
    },
    {
      icon: <Move3D className="w-5 h-5" strokeWidth={1.5} />,
      label: "Move",
      handleClick: () => toggleEditorMode(true),
      isActive: isEditorMode,
    },
    {
      icon: <Grid3X3 className="w-5 h-5" strokeWidth={1.5} />,
      label: "Grid",
      handleClick: () => toggleGrid(),
      isActive: showGrid,
    },
    {
      icon: <Camera className="w-5 h-5" strokeWidth={1.5} />,
      label: "Screenshot",
      handleClick: () => {},
      isActive: false,
    },
  ];

  return (
    <div className="absolute z-50 -right-14 top-16 border px-1 py-1.5 rounded-lg bg-background shadow-md">
      <TooltipProvider openDelay={400}>
        <div className="flex flex-col  ">
          {tools.map((tool) => (
            <ToolTopItem key={tool.label} {...tool} />
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

const ToolTopItem = ({
  icon,
  label,
  handleClick,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  handleClick: () => void;
  isActive: boolean;
}) => {
  return (
    <Tooltip side="right">
      <TooltipTrigger>
        <div
          className={cn(
            isActive && "text-chart-2",
            "flex items-center justify-center w-full h-full  cursor-pointer border-b last:border-b-0 p-2"
          )}
          aria-label={label}
          title={label}
          onClick={handleClick}
        >
          {icon}
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};
