"use client";

import React from "react";
import { usePostprocessingStore } from "../../store/postprocessingStore";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Sparkles,
  Layers,
  Camera,
  Palette,
  Eye,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const PostprocessingSettings = () => {
  const {
    bloom,
    ssao,
    vignette,
    chromaticAberration,
    colorCorrection,
    setBloom,
    setSSAO,
    setVignette,
    setChromaticAberration,
    setColorCorrection,
  } = usePostprocessingStore();

  return (
    <div className="space-y-3 p-2 overflow-y-auto flex-1 h-full min-h-0">
      {/* Bloom Section */}
      <Collapsible defaultOpen>
        <div className="flex items-center justify-between px-2 py-1">
          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1 text-left">
            <Sparkles className="w-4 h-4 text-yellow-500/80" />
            <span className="font-medium text-sm">Bloom</span>
            <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
          </CollapsibleTrigger>
          <Switch
            checked={bloom.enabled}
            onCheckedChange={(enabled: boolean) => setBloom({ enabled })}
          />
        </div>
        <CollapsibleContent>
          <div
            className={cn(
              "space-y-4 mt-2 px-2 pb-2",
              !bloom.enabled && "opacity-50 pointer-events-none",
            )}
          >
            <PropertySlider
              label="Intensity"
              value={bloom.intensity}
              min={0}
              max={2}
              step={0.01}
              onChange={(val) => setBloom({ intensity: val })}
            />
            <PropertySlider
              label="Threshold"
              value={bloom.luminanceThreshold}
              min={0}
              max={1}
              step={0.01}
              onChange={(val) => setBloom({ luminanceThreshold: val })}
            />
            <PropertySlider
              label="Smoothing"
              value={bloom.luminanceSmoothing}
              min={0}
              max={1}
              step={0.01}
              onChange={(val) => setBloom({ luminanceSmoothing: val })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Ambient Occlusion (SSAO) */}
      <Collapsible>
        <div className="flex items-center justify-between px-2 py-2">
          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1 text-left">
            <Layers className="w-4 h-4 text-blue-500/80" />
            <span className="font-medium text-sm">Ambient Occlusion</span>
            <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
          </CollapsibleTrigger>
          <Switch
            checked={ssao.enabled}
            onCheckedChange={(enabled: boolean) => setSSAO({ enabled })}
          />
        </div>
        <CollapsibleContent>
          <div
            className={cn(
              "space-y-4 mt-2 px-2 pb-2",
              !ssao.enabled && "opacity-50 pointer-events-none",
            )}
          >
            <PropertySlider
              label="Intensity"
              value={ssao.intensity}
              min={0}
              max={5}
              step={0.1}
              onChange={(val) => setSSAO({ intensity: val })}
            />
            <PropertySlider
              label="Radius"
              value={ssao.radius}
              min={0}
              max={1}
              step={0.01}
              onChange={(val) => setSSAO({ radius: val })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Camera Effects */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md group">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-500/80" />
            <span className="font-medium text-sm">Camera Effects</span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-6 mt-4 px-2 pb-2">
            {/* Vignette */}
            <div className="space-y-3 pt-2 border-t border-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Vignette
                </span>
                <Switch
                  checked={vignette.enabled}
                  onCheckedChange={(enabled: boolean) =>
                    setVignette({ enabled })
                  }
                />
              </div>
              <div
                className={cn(
                  !vignette.enabled && "opacity-50 pointer-events-none",
                )}
              >
                <PropertySlider
                  label="Offset"
                  value={vignette.offset}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(val) => setVignette({ offset: val })}
                />
                <PropertySlider
                  label="Darkness"
                  value={vignette.darkness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(val) => setVignette({ darkness: val })}
                />
              </div>
            </div>

            {/* Chromatic Aberration */}
            <div className="space-y-3 pt-4 border-t border-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Abberation
                </span>
                <Switch
                  checked={chromaticAberration.enabled}
                  onCheckedChange={(enabled: boolean) =>
                    setChromaticAberration({ enabled })
                  }
                />
              </div>
              <div
                className={cn(
                  !chromaticAberration.enabled &&
                    "opacity-50 pointer-events-none",
                )}
              >
                <PropertySlider
                  label="Displacement"
                  value={chromaticAberration.offset[0]}
                  min={0}
                  max={0.02}
                  step={0.001}
                  onChange={(val) =>
                    setChromaticAberration({ offset: [val, val] })
                  }
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Color Correction */}
      <Collapsible>
        <div className="flex items-center justify-between px-2 py-2">
          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1 text-left">
            <Palette className="w-4 h-4 text-emerald-500/80" />
            <span className="font-medium text-sm">Color Correction</span>
            <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
          </CollapsibleTrigger>
          <Switch
            checked={colorCorrection.enabled}
            onCheckedChange={(enabled: boolean) =>
              setColorCorrection({ enabled })
            }
          />
        </div>
        <CollapsibleContent>
          <div
            className={cn(
              "space-y-4 mt-2 px-2 pb-2",
              !colorCorrection.enabled && "opacity-50 pointer-events-none",
            )}
          >
            <PropertySlider
              label="Brightness"
              value={colorCorrection.brightness}
              min={-0.5}
              max={0.5}
              step={0.01}
              onChange={(val) => setColorCorrection({ brightness: val })}
            />
            <PropertySlider
              label="Contrast"
              value={colorCorrection.contrast}
              min={-0.5}
              max={0.5}
              step={0.01}
              onChange={(val) => setColorCorrection({ contrast: val })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Performance Switch placeholder/Coming Soon */}
      <div className="flex items-center gap-2 px-3 py-2 mt-4 rounded-lg bg-accent/30 opacity-60">
        <Eye className="w-3.5 h-3.5" />
        <span className="text-[10px] font-medium italic">
          Settings are applied globally
        </span>
      </div>

      <div className="h-10 grow" />
    </div>
  );
};

// Reusable slider component to match the studio aesthetic
function PropertySlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-muted-foreground font-medium">
          {label}
        </label>
        <span className="text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2 hover:[&::-webkit-slider-thumb]:bg-chart-2/80 transition-colors"
      />
    </div>
  );
}
