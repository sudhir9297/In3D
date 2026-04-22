"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/huge-icon";
import { Switch } from "@/components/ui/switch";
import {
  QualityPreset,
  usePostprocessingStore,
} from "../../store/postprocessingStore";
import {
  ArrowDown01Icon,
  ColorsIcon,
  Moon02Icon,
  MirrorIcon,
  Settings02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

const QUALITY_PRESET_OPTIONS: Array<{
  value: QualityPreset;
  label: string;
  helper: string;
}> = [
  {
    value: "default",
    label: "Default",
    helper: "Uses the earlier custom N8AO setup we had in this project.",
  },
  {
    value: "performance",
    label: "Performance",
    helper: "Minimal GI and smaller shadows for weak GPUs.",
  },
  {
    value: "balanced",
    label: "Balanced",
    helper: "Keeps reflections while easing off the heaviest passes.",
  },
  {
    value: "high",
    label: "High",
    helper: "Full-quality reflections, GI, and larger shadows.",
  },
];

function useRafThrottledNumber(callback: (value: number) => void) {
  const frameRef = React.useRef<number | null>(null);
  const latestValueRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return React.useCallback(
    (value: number) => {
      latestValueRef.current = value;
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        if (latestValueRef.current !== null) {
          callback(latestValueRef.current);
        }
      });
    },
    [callback],
  );
}

function EffectToggle({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-1 py-1">
      <span className="text-sm">{label}</span>
      <Button
        variant={enabled ? "secondary" : "ghost"}
        size="xs"
        className="h-7 px-2 text-[11px]"
        onClick={onClick}
      >
        {enabled ? "On" : "Off"}
      </Button>
    </div>
  );
}

function PropertySlider({
  label,
  value,
  min,
  max,
  step,
  valueDisplay,
  onValueChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueDisplay: string;
  onValueChange: (value: number) => void;
}) {
  const throttledValueChange = useRafThrottledNumber(onValueChange);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-muted-foreground">
          {label}
        </label>
        <span className="bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {valueDisplay}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          throttledValueChange(parseFloat(event.target.value))
        }
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2"
      />
    </div>
  );
}

export const PostprocessingSettings = () => {
  const activePipeline = usePostprocessingStore((state) => state.activePipeline);
  const qualityPreset = usePostprocessingStore((state) => state.qualityPreset);
  const autoQuality = usePostprocessingStore((state) => state.autoQuality);
  const setQualityPreset = usePostprocessingStore(
    (state) => state.setQualityPreset,
  );
  const setAutoQuality = usePostprocessingStore((state) => state.setAutoQuality);
  const bloom = usePostprocessingStore((state) => state.bloom);
  const ssr = usePostprocessingStore((state) => state.ssr);
  const ssgi = usePostprocessingStore((state) => state.ssgi);
  const setBloom = usePostprocessingStore((state) => state.setBloom);
  const setSsr = usePostprocessingStore((state) => state.setSsr);
  const setSsgi = usePostprocessingStore((state) => state.setSsgi);
  const n8ao = usePostprocessingStore((state) => state.n8ao);
  const setN8ao = usePostprocessingStore((state) => state.setN8ao);

  return (
    <div className="space-y-3 px-2 flex-1 h-full min-h-0 overflow-y-auto">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={Settings02Icon} className="h-4 w-4" />
            <span className="font-medium text-sm">Render Quality</span>
          </div>
          <Icon
            icon={ArrowDown01Icon}
            className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-3 px-2 pb-2">
            <div className="flex items-center justify-between rounded-md border border-border/60 px-2 py-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">
                  Auto Adapt
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Let the viewport step quality up or down based on frame stability.
                </p>
              </div>
              <Switch checked={autoQuality} onCheckedChange={setAutoQuality} />
            </div>

            <div className="grid gap-2">
              {QUALITY_PRESET_OPTIONS.map((option) => {
                const isActive = qualityPreset === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setQualityPreset(option.value)}
                    className={`rounded-md border px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "border-chart-2/60 bg-chart-2/8"
                        : "border-border/60 hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option.label}</span>
                      {isActive ? (
                        <span className="text-[10px] uppercase tracking-[0.16em] text-chart-2">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {option.helper}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {activePipeline === "n8ao" ? (
        <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={Moon02Icon} className="h-4 w-4" />
            <span className="font-medium text-sm">N8AO</span>
          </div>
          <Icon
            icon={ArrowDown01Icon}
            className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <EffectToggle
              label="Enable"
              enabled={n8ao.enabled}
              onClick={() => setN8ao({ enabled: !n8ao.enabled })}
            />
            <EffectToggle
              label="Screen Space Radius"
              enabled={n8ao.screenSpaceRadius}
              onClick={() =>
                setN8ao({ screenSpaceRadius: !n8ao.screenSpaceRadius })
              }
            />
            <PropertySlider
              label="AO Radius"
              value={n8ao.aoRadius}
              min={1}
              max={64}
              step={1}
              valueDisplay={n8ao.aoRadius.toFixed(0)}
              onValueChange={(value) => setN8ao({ aoRadius: value })}
            />
            <PropertySlider
              label="Intensity"
              value={n8ao.intensity}
              min={0}
              max={10}
              step={0.1}
              valueDisplay={n8ao.intensity.toFixed(1)}
              onValueChange={(value) => setN8ao({ intensity: value })}
            />
            <PropertySlider
              label="Distance Falloff"
              value={n8ao.distanceFalloff}
              min={0.1}
              max={5}
              step={0.1}
              valueDisplay={n8ao.distanceFalloff.toFixed(1)}
              onValueChange={(value) => setN8ao({ distanceFalloff: value })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      ) : null}

      {activePipeline === "legacy" ? (
        <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={SparklesIcon} className="h-4 w-4" />
            <span className="font-medium text-sm">Bloom</span>
          </div>
          <Icon
            icon={ArrowDown01Icon}
            className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <EffectToggle
              label="Enable"
              enabled={bloom.enabled}
              onClick={() => setBloom({ enabled: !bloom.enabled })}
            />
            <PropertySlider
              label="Strength"
              value={bloom.strength}
              min={0}
              max={2}
              step={0.01}
              valueDisplay={bloom.strength.toFixed(2)}
              onValueChange={(value) => setBloom({ strength: value })}
            />
            <PropertySlider
              label="Radius"
              value={bloom.radius}
              min={0}
              max={2}
              step={0.01}
              valueDisplay={bloom.radius.toFixed(2)}
              onValueChange={(value) => setBloom({ radius: value })}
            />
            <PropertySlider
              label="Threshold"
              value={bloom.threshold}
              min={0}
              max={2}
              step={0.01}
              valueDisplay={bloom.threshold.toFixed(2)}
              onValueChange={(value) => setBloom({ threshold: value })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      ) : null}

      {activePipeline === "legacy" ? (
        <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={MirrorIcon} className="h-4 w-4" />
            <span className="font-medium text-sm">SSR</span>
          </div>
          <Icon
            icon={ArrowDown01Icon}
            className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <EffectToggle
              label="Enable"
              enabled={ssr.enabled}
              onClick={() => setSsr({ enabled: !ssr.enabled })}
            />
            <PropertySlider
              label="Max Distance"
              value={ssr.maxDistance}
              min={0}
              max={25}
              step={0.1}
              valueDisplay={ssr.maxDistance.toFixed(1)}
              onValueChange={(value) => setSsr({ maxDistance: value })}
            />
            <PropertySlider
              label="Blur Quality"
              value={ssr.blurQuality}
              min={0}
              max={3}
              step={1}
              valueDisplay={ssr.blurQuality.toFixed(0)}
              onValueChange={(value) => setSsr({ blurQuality: value })}
            />
            <PropertySlider
              label="Thickness"
              value={ssr.thickness}
              min={0.01}
              max={2}
              step={0.01}
              valueDisplay={ssr.thickness.toFixed(2)}
              onValueChange={(value) => setSsr({ thickness: value })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      ) : null}

      {activePipeline === "legacy" ? (
        <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={ColorsIcon} className="h-4 w-4" />
            <span className="font-medium text-sm">SSGI</span>
          </div>
          <Icon
            icon={ArrowDown01Icon}
            className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <EffectToggle
              label="Enable"
              enabled={ssgi.enabled}
              onClick={() => setSsgi({ enabled: !ssgi.enabled })}
            />
            <PropertySlider
              label="Slice Count"
              value={ssgi.sliceCount}
              min={1}
              max={8}
              step={1}
              valueDisplay={ssgi.sliceCount.toFixed(0)}
              onValueChange={(value) => setSsgi({ sliceCount: value })}
            />
            <PropertySlider
              label="Step Count"
              value={ssgi.stepCount}
              min={1}
              max={32}
              step={1}
              valueDisplay={ssgi.stepCount.toFixed(0)}
              onValueChange={(value) => setSsgi({ stepCount: value })}
            />
            <PropertySlider
              label="Radius"
              value={ssgi.radius}
              min={0.1}
              max={10}
              step={0.1}
              valueDisplay={ssgi.radius.toFixed(1)}
              onValueChange={(value) => setSsgi({ radius: value })}
            />
            <PropertySlider
              label="GI Intensity"
              value={ssgi.giIntensity}
              min={0}
              max={5}
              step={0.1}
              valueDisplay={ssgi.giIntensity.toFixed(1)}
              onValueChange={(value) => setSsgi({ giIntensity: value })}
            />
            <PropertySlider
              label="AO Intensity"
              value={ssgi.aoIntensity}
              min={0}
              max={5}
              step={0.1}
              valueDisplay={ssgi.aoIntensity.toFixed(1)}
              onValueChange={(value) => setSsgi({ aoIntensity: value })}
            />
            <PropertySlider
              label="Thickness"
              value={ssgi.thickness}
              min={0.01}
              max={10}
              step={0.01}
              valueDisplay={ssgi.thickness.toFixed(2)}
              onValueChange={(value) => setSsgi({ thickness: value })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      ) : null}
    </div>
  );
};
