"use client";

import React from "react";
import {
  useEnvironmentStore,
  ToneMappingMode,
} from "../../store/environmentStore";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Palette,
  Sun,
  Maximize2,
  Settings2,
  ImagePlus,
  X,
} from "lucide-react";

const HDR_PRESETS = [
  "apartment",
  "city",
  "dawn",
  "forest",
  "lobby",
  "night",
  "park",
  "studio",
  "sunset",
  "warehouse",
];

const TONE_MAPPING_MODES: ToneMappingMode[] = [
  "None",
  "Linear",
  "Reinhard",
  "Cineon",
  "ACESFilmic",
  "AgX",
  "Neutral",
];

export const EnvironmentSettings = () => {
  const {
    backgroundColor,
    setBackgroundColor,
    showHDR,
    setShowHDR,
    hdrPath,
    setHdrPath,
    hdrBlur,
    setHdrBlur,
    hdrRotation,
    setHdrRotation,
    hdrIntensity,
    setHdrIntensity,
    fogEnabled,
    setFogEnabled,
    fogColor,
    setFogColor,
    fogDensity,
    setFogDensity,
    ambientIntensity,
    setAmbientIntensity,
    ambientColor,
    setAmbientColor,
    backgroundImage,
    setBackgroundImage,
    exposure,
    setExposure,
    toneMapping,
    setToneMapping,
  } = useEnvironmentStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke the old URL if it exists to prevent memory leaks
      if (backgroundImage && backgroundImage.startsWith("blob:")) {
        URL.revokeObjectURL(backgroundImage);
      }
      const url = URL.createObjectURL(file);
      setBackgroundImage(url);
    }
    // Reset the input value so the same file can be uploaded again
    e.target.value = "";
  };

  const handleClearImage = () => {
    if (backgroundImage && backgroundImage.startsWith("blob:")) {
      URL.revokeObjectURL(backgroundImage);
    }
    setBackgroundImage(null);
  };

  return (
    <div className="space-y-3 p-2 overflow-y-auto flex-1 h-full min-h-0">
      {/* Background Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="font-medium text-sm">Background</span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-6 h-6 rounded border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Background Image
              </label>
              <div className="relative group w-32 aspect-square mt-2">
                <label
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer transition-all overflow-hidden bg-muted/30",
                    backgroundImage
                      ? "border-chart-2 border-solid"
                      : "hover:border-chart-2 border-muted-foreground/30",
                  )}
                >
                  {backgroundImage ? (
                    <img
                      src={backgroundImage}
                      alt="Background Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-muted-foreground">
                      <ImagePlus className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px]">Upload Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                {backgroundImage && (
                  <button
                    onClick={handleClearImage}
                    className="absolute -top-2 -right-2 p-1 bg-background border rounded-full shadow-sm hover:bg-destructive/10 hover:text-destructive transition-colors z-10"
                    title="Clear Background Image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* HDR Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            <span className="font-medium text-sm">Environment (HDR)</span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <div className="flex items-center justify-between py-1">
              <label className="text-xs text-muted-foreground">
                Show HDR Background
              </label>
              <button
                onClick={() => setShowHDR(!showHDR)}
                className={cn(
                  "group relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-chart-2 focus:ring-offset-2",
                  showHDR ? "bg-chart-2" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out",
                    showHDR ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Preset</label>
              <select
                value={hdrPath}
                onChange={(e) => setHdrPath(e.target.value)}
                className="text-xs bg-muted border rounded px-2 py-1 cursor-pointer outline-none focus:ring-1 focus:ring-chart-2 w-32"
              >
                {HDR_PRESETS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Intensity
                </label>
                <input
                  type="number"
                  value={hdrIntensity}
                  step={0.1}
                  min={0}
                  max={5}
                  onChange={(e) =>
                    setHdrIntensity(parseFloat(e.target.value) || 0)
                  }
                  className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono"
                />
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={hdrIntensity}
                onChange={(e) => setHdrIntensity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Rotation
                </label>
                <input
                  type="number"
                  value={hdrRotation}
                  step={1}
                  min={0}
                  max={360}
                  onChange={(e) =>
                    setHdrRotation(parseFloat(e.target.value) || 0)
                  }
                  className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono"
                />
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={hdrRotation}
                onChange={(e) => setHdrRotation(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  HDR Blur
                </label>
                <input
                  type="number"
                  value={hdrBlur}
                  step={0.01}
                  min={0}
                  max={1}
                  onChange={(e) => setHdrBlur(parseFloat(e.target.value) || 0)}
                  className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono"
                />
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={hdrBlur}
                onChange={(e) => setHdrBlur(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Lighting Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 opacity-70" />
            <span className="font-medium text-sm">Ambient Light</span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={ambientColor}
                  onChange={(e) => setAmbientColor(e.target.value)}
                  className="w-6 h-6 rounded border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={ambientColor}
                  onChange={(e) => setAmbientColor(e.target.value)}
                  className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Intensity
                </label>
                <input
                  type="number"
                  value={ambientIntensity}
                  step={0.1}
                  min={0}
                  max={2}
                  onChange={(e) =>
                    setAmbientIntensity(parseFloat(e.target.value) || 0)
                  }
                  className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono"
                />
              </div>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={ambientIntensity}
                onChange={(e) =>
                  setAmbientIntensity(parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Fog Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            <span className="font-medium text-sm">Atmospheric Fog</span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <div className="flex items-center justify-between py-1">
              <label className="text-xs text-muted-foreground">
                Enable Fog
              </label>
              <button
                onClick={() => setFogEnabled(!fogEnabled)}
                className={cn(
                  "group relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-chart-2 focus:ring-offset-2",
                  fogEnabled ? "bg-chart-2" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out",
                    fogEnabled ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fogColor}
                  onChange={(e) => setFogColor(e.target.value)}
                  className="w-6 h-6 rounded border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={fogColor}
                  onChange={(e) => setFogColor(e.target.value)}
                  className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Density</label>
                <input
                  type="number"
                  value={fogDensity}
                  step={0.001}
                  min={0}
                  max={0.1}
                  onChange={(e) =>
                    setFogDensity(parseFloat(e.target.value) || 0)
                  }
                  className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono"
                />
              </div>
              <input
                type="range"
                min={0}
                max={0.1}
                step={0.001}
                value={fogDensity}
                onChange={(e) => setFogDensity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Rendering Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            <span className="font-medium text-sm">Tone Mapping</span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Mode</label>
              <select
                value={toneMapping}
                onChange={(e) =>
                  setToneMapping(e.target.value as ToneMappingMode)
                }
                className="text-xs bg-muted border rounded px-2 py-1 cursor-pointer outline-none focus:ring-1 focus:ring-chart-2 w-32"
              >
                {TONE_MAPPING_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Exposure
                </label>
                <input
                  type="number"
                  value={exposure}
                  step={0.1}
                  min={0}
                  max={4}
                  onChange={(e) => setExposure(parseFloat(e.target.value) || 0)}
                  className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono"
                />
              </div>
              <input
                type="range"
                min={0}
                max={4}
                step={0.1}
                value={exposure}
                onChange={(e) => setExposure(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Spacer for better scrolling */}
      <div className="h-10 shrink-0" />
    </div>
  );
};

export default EnvironmentSettings;
