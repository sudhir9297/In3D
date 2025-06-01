import { Camera, Grid3X3 } from "lucide-react";
import { Move3D } from "lucide-react";
import { MousePointerClick } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useViewportStore } from "../../store/viewportStore";
import { cn } from "@/lib/utils";

export const Toolbar = () => {
  const { showGrid, isEditorMode, toggleGrid, toggleEditorMode } =
    useViewportStore();

  const tools = [
    {
      icon: MousePointerClick,
      label: "Select",
      handleClick: () => toggleEditorMode(false),
      isActive: !isEditorMode,
    },
    {
      icon: Move3D,
      label: "Move",
      handleClick: () => toggleEditorMode(true),
      isActive: isEditorMode,
    },
    {
      icon: Grid3X3,
      label: "Grid",
      handleClick: () => toggleGrid(),
      isActive: showGrid,
    },
    {
      icon: Camera,
      label: "Screenshot",
      handleClick: () => {},
      isActive: false,
    },
  ];

  return (
    <div className="absolute z-50 left-4 top-10 border rounded bg-background shadow-md">
      <TooltipProvider>
        {tools.map((tool) => (
          <ToolTopItem key={tool.label} {...tool} />
        ))}
      </TooltipProvider>
    </div>
  );
};

const ToolTopItem = ({ icon, label, handleClick, isActive }) => {
  const Icon = icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            isActive && "text-chart-2",
            "w-10 h-10 flex items-center justify-center  cursor-pointer  last:border-none border-b"
          )}
          aria-label={label}
          title={label}
          onClick={handleClick}
        >
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
