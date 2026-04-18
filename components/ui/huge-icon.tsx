"use client";

import {
  HugeiconsIcon,
  type HugeiconsIconProps,
} from "@hugeicons/react";

import { cn } from "@/lib/utils";

type IconProps = HugeiconsIconProps;

export function Icon({
  className,
  strokeWidth = 1.5,
  color = "currentColor",
  ...props
}: IconProps) {
  return (
    <HugeiconsIcon
      {...props}
      className={cn("shrink-0", className)}
      strokeWidth={strokeWidth}
      color={color}
    />
  );
}
