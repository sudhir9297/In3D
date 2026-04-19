"use client";

import * as React from "react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip";
import { Icon } from "@/components/ui/huge-icon";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip side="left">
      <TooltipTrigger>
        <div className="w-full">
          <button
            type="button"
            aria-label={label}
            title={label}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-none border-b border-border px-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
              className,
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center">
              <Icon
                icon={isDark ? Sun03Icon : Moon02Icon}
                className="h-4 w-4"
              />
              <span className="sr-only">{label}</span>
            </div>
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
