"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "group/switch peer inline-flex shrink-0 items-center rounded-[2px] border border-[color:color-mix(in_oklab,var(--border)_90%,black_10%)] bg-[color:color-mix(in_oklab,var(--background)_70%,var(--muted)_30%)] p-[2px] transition-colors outline-none focus-visible:border-[color:color-mix(in_oklab,var(--foreground)_35%,var(--border)_65%)] focus-visible:ring-[3px] focus-visible:ring-black/5 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[color:color-mix(in_oklab,var(--foreground)_22%,var(--border)_78%)] data-[state=checked]:bg-[color:color-mix(in_oklab,var(--foreground)_12%,var(--background)_88%)] data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-[1px] border border-[color:color-mix(in_oklab,var(--border)_86%,black_14%)] bg-[color:color-mix(in_oklab,var(--background)_94%,black_6%)] shadow-none transition-transform duration-150 ease-out group-data-[size=default]/switch:size-3.5 group-data-[size=sm]/switch:size-2.5 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
