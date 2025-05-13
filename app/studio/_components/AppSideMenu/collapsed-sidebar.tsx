import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

export const RightSideBar = ({ isOpen }: { isOpen: boolean }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (isOpen) {
      menu.style.width = "240px";
      menu.style.minWidth = "240px";
      menu.style.visibility = "visible";
    } else {
      menu.style.width = "0";
      menu.style.minWidth = "0";

      const timer = setTimeout(() => {
        if (!isOpen) {
          menu.style.visibility = "hidden";
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div
      className={cn(
        "border-b md:border-l md:h-full flex-1",
        isOpen ? "block" : "hidden"
      )}
    >
      <div className="p-4 text-xs">
        <h3 className="font-medium mb-2">Design Settings</h3>
        <p>Design settings and options will appear here.</p>
      </div>
    </div>
  );
};
