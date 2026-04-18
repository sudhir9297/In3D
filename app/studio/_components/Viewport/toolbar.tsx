import {
  Camera01Icon,
  Cursor02Icon,
  GridTableIcon,
  ThreeDMoveIcon,
  ThreeDRotateIcon,
  ThreeDScaleIcon,
} from "@hugeicons/core-free-icons";

import { useViewportStore } from "../../store/viewportStore";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/huge-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip";

export const Toolbar = () => {
  const {
    showGrid,
    isEditorMode,
    transformMode,
    toggleGrid,
    toggleEditorMode,
    setTransformMode,
    requestScreenshot,
  } = useViewportStore();

  const tools = [
    {
      icon: <Icon icon={Cursor02Icon} className="h-5 w-5" />,
      label: "Select",
      handleClick: () => toggleEditorMode(false),
      isActive: !isEditorMode,
    },
    {
      icon: <Icon icon={ThreeDMoveIcon} className="h-5 w-5" />,
      label: "Move",
      handleClick: () => {
        setTransformMode("translate");
        toggleEditorMode(true);
      },
      isActive: isEditorMode && transformMode === "translate",
    },
    {
      icon: <Icon icon={ThreeDRotateIcon} className="h-5 w-5" />,
      label: "Rotate",
      handleClick: () => {
        setTransformMode("rotate");
        toggleEditorMode(true);
      },
      isActive: isEditorMode && transformMode === "rotate",
    },
    {
      icon: <Icon icon={ThreeDScaleIcon} className="h-5 w-5" />,
      label: "Scale",
      handleClick: () => {
        setTransformMode("scale");
        toggleEditorMode(true);
      },
      isActive: isEditorMode && transformMode === "scale",
    },
    {
      icon: <Icon icon={GridTableIcon} className="h-5 w-5" />,
      label: "Grid",
      handleClick: () => toggleGrid(),
      isActive: showGrid,
    },
    {
      icon: <Icon icon={Camera01Icon} className="h-5 w-5" />,
      label: "Screenshot",
      handleClick: requestScreenshot,
      isActive: false,
    },
  ];

  return (
    <div className="studio-panel absolute left-4 top-4 z-50 w-12 overflow-hidden bg-card/94 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-sm">
      <TooltipProvider openDelay={400}>
        <div className="flex flex-col">
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
            isActive && "bg-background text-foreground",
            "flex h-12 w-12 items-center justify-center border-b border-border last:border-b-0 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
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
