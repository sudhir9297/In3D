"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/huge-icon";
import { usePostprocessingStore } from "../../store/postprocessingStore";
import {
  ArrowDown01Icon,
  ColorsIcon,
  MirrorIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

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
    <div className="flex items-center justify-between border border-border px-3 py-2">
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
        onChange={(event) => onValueChange(parseFloat(event.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2"
      />
    </div>
  );
}

export const PostprocessingSettings = () => {
  const bloom = usePostprocessingStore((state) => state.bloom);
  const ssr = usePostprocessingStore((state) => state.ssr);
  const ssgi = usePostprocessingStore((state) => state.ssgi);
  const setBloom = usePostprocessingStore((state) => state.setBloom);
  const setSsr = usePostprocessingStore((state) => state.setSsr);
  const setSsgi = usePostprocessingStore((state) => state.setSsgi);

  return (
    <div className="space-y-3 px-2 flex-1 h-full min-h-0 overflow-y-auto">
      <Collapsible defaultOpen>
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
              label="Bloom"
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

      <Collapsible defaultOpen>
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
              label="SSR"
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

      <Collapsible defaultOpen>
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
              label="SSGI"
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
    </div>
  );
};
