"use client";
import { AppSidebar } from "./_components/AppSideMenu/app-sidebar";
import { ViewerWrapper } from "./_components/viewer";

import {
  Box,
  Circle,
  Layers,
  Move,
  PanelRight,
  Plus,
  Square,
  Triangle,
} from "lucide-react";
import { useState } from "react";

export default function Page() {
  const [isCollapsibleMenuOpen, setIsCollapsibleMenuOpen] = useState(true);

  const tools = [
    { icon: Layers, label: "Layers" },
    { icon: Plus, label: "Add" },
    { icon: Triangle, label: "Triangle" },
    { icon: Move, label: "Move" },
    { icon: Square, label: "Square" },
    { icon: Box, label: "Box" },
    { icon: Circle, label: "Circle" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen ">
      <div className="h-1/2 w-full md:h-full  flex-1 relative ">
        <div className="absolute z-50 left-4 top-10 border rounded bg-background shadow-md">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const isLast = index === tools.length - 1;

            return (
              <button
                key={tool.label}
                className={`w-10 h-10 flex items-center justify-center transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500  ${
                  !isLast ? "border-b" : ""
                }`}
                aria-label={tool.label}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <button
          className="hidden md:absolute top-2 right-2 z-50  p-1 rounded"
          onClick={() => setIsCollapsibleMenuOpen(!isCollapsibleMenuOpen)}
        >
          <PanelRight className="w-4 h-4" />
        </button>
        <ViewerWrapper />
      </div>

      <AppSidebar isOpen={isCollapsibleMenuOpen} />
    </div>
  );
}
