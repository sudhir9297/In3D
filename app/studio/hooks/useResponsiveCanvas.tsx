import { useEffect, useRef } from "react";
import { useResponsiveLayout } from "./useResponsiveLayout";

export function useResponsiveCanvas(
  sidebarIsOpen: boolean,
  sidebarWidth = 400
) {
  const { isMobile } = useResponsiveLayout(768);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current || !canvasRef.current) return;

      if (isMobile) {
        // For mobile: make both elements full screen regardless of sidebar state
        containerRef.current.style.width = "100%";
        canvasRef.current.style.width = "100%";
      } else {
        // For desktop: adjust width based on sidebar state
        const totalWidth = window.innerWidth;
        const effectiveSidebarWidth = sidebarIsOpen ? sidebarWidth : 40;
        const remainingWidth = totalWidth - effectiveSidebarWidth;

        containerRef.current.style.width = `${remainingWidth}px`;
        canvasRef.current.style.width = `${remainingWidth}px`;
      }

      // Dispatch resize event to ensure Three.js/R3F updates properly
      window.dispatchEvent(new Event("resize"));
    };

    // Initial update
    updateDimensions();

    // Debounced window resize handler
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        updateDimensions();
      }, 100);
    };

    // Listen for window resize events
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [sidebarIsOpen, sidebarWidth, isMobile]); // Added isMobile to dependencies

  return { containerRef, canvasRef };
}
