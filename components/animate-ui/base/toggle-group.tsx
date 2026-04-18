"use client";

import * as React from "react";
import {
  type HTMLMotionProps,
  type Transition,
  motion,
  AnimatePresence,
} from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:text-muted-foreground text-accent-foreground transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 data-[pressed]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none focus:outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      type: {
        single: "",
        multiple: "data-[pressed]:bg-accent",
      },
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent shadow-xs",
      },
      size: {
        default: "h-9 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ToggleValue = string;

type ToggleGroupContextProps = VariantProps<typeof toggleVariants> & {
  type: "single" | "multiple";
  transition?: Transition;
  activeClassName?: string;
  globalId: string;
  selectedValues: ToggleValue[];
  toggleValue: (value: ToggleValue) => void;
};

const ToggleGroupContext = React.createContext<
  ToggleGroupContextProps | undefined
>(undefined);

const useToggleGroup = (): ToggleGroupContextProps => {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("useToggleGroup must be used within a ToggleGroup");
  }
  return context;
};

type ToggleGroupProps = React.HTMLAttributes<HTMLDivElement> &
  Omit<VariantProps<typeof toggleVariants>, "type"> & {
    transition?: Transition;
    activeClassName?: string;
    toggleMultiple?: boolean;
    value?: ToggleValue[];
    defaultValue?: ToggleValue[];
    onValueChange?: (value: ToggleValue[]) => void;
    children?: React.ReactNode;
  };

function ToggleGroup({
  className,
  variant,
  size,
  children,
  transition = { type: "spring", bounce: 0, stiffness: 200, damping: 25 },
  activeClassName,
  toggleMultiple = false,
  value,
  defaultValue = [],
  onValueChange,
  ...props
}: ToggleGroupProps) {
  const globalId = React.useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] =
    React.useState<ToggleValue[]>(defaultValue);

  const selectedValues = isControlled ? value : internalValue;

  const toggleValue = React.useCallback(
    (nextValue: ToggleValue) => {
      const nextSelectedValues = toggleMultiple
        ? selectedValues.includes(nextValue)
          ? selectedValues.filter((item) => item !== nextValue)
          : [...selectedValues, nextValue]
        : [nextValue];

      if (!isControlled) {
        setInternalValue(nextSelectedValues);
      }

      onValueChange?.(nextSelectedValues);
    },
    [isControlled, onValueChange, selectedValues, toggleMultiple],
  );

  return (
    <ToggleGroupContext.Provider
      value={{
        variant,
        size,
        type: toggleMultiple ? "multiple" : "single",
        transition,
        activeClassName,
        globalId,
        selectedValues,
        toggleValue,
      }}
    >
      <div
        data-slot="toggle-group"
        className={cn(
          "relative flex items-center justify-center gap-1",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

type ToggleGroupItemProps = Omit<HTMLMotionProps<"button">, "value"> &
  Omit<VariantProps<typeof toggleVariants>, "type"> & {
    value: ToggleValue;
    children?: React.ReactNode;
    spanProps?: React.ComponentProps<"span">;
  };

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem(
    {
      className,
      children,
      variant,
      size,
      spanProps,
      value,
      onClick,
      ...props
    },
    ref,
  ) {
    const {
      activeClassName,
      transition,
      type,
      variant: contextVariant,
      size: contextSize,
      globalId,
      selectedValues,
      toggleValue,
    } = useToggleGroup();

    const isActive = selectedValues.includes(value);

    return (
      <motion.button
        ref={ref}
        type="button"
        data-slot="toggle-group-item"
        data-pressed={isActive ? "" : undefined}
        aria-pressed={isActive}
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.94 }}
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            toggleValue(value);
          }
        }}
        className="relative w-full"
      >
        <span
          {...spanProps}
          {...(isActive ? { "data-pressed": "" } : {})}
          className={cn(
            "relative z-[1]",
            toggleVariants({
              variant: variant || contextVariant,
              size: size || contextSize,
              type,
            }),
            className,
            spanProps?.className,
          )}
        >
          {children}
        </span>

        <AnimatePresence initial={false}>
          {isActive && type === "single" && (
            <motion.span
              layoutId={`active-toggle-group-item-${globalId}`}
              data-slot="active-toggle-group-item"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
              className={cn(
                "absolute inset-0 z-0 rounded-md bg-muted",
                activeClassName,
              )}
            />
          )}
        </AnimatePresence>
      </motion.button>
    );
  },
);

export {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
};
