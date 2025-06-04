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
    <div className="absolute z-50 left-4 top-10 border px-1 py-1.5 rounded-lg bg-background shadow-md">
      <TooltipProvider openDelay={400}>
        <ToggleGroup
          defaultValue={[tools[0].label]}
          toggleMultiple={false}
          className="flex flex-col "
        >
          {tools.map((tool) => (
            <ToggleGroupItem
              key={tool.label}
              value={tool.label}
              aria-label="Toggle bold "
            >
              <ToolTopItem {...tool} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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
            "flex items-center justify-center w-full h-full  cursor-pointer "
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
