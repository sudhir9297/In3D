"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useEnvironmentStore,
  ToneMappingMode,
} from "../../store/environmentStore";
import { getTextureRequestUrl } from "../../utils/textureLoaders";
import {
  LightingPreset,
  useLightingStore,
} from "../../store/lightingStore";
import {
  formatLightingClock,
  getPresetDetails,
  resolveStylizedLightingPreset,
  STYLIZED_LIGHTING_PRESET_OPTIONS,
  STYLIZED_LIGHTING_TIME_MARKS,
} from "../../utils/stylizedLighting";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  ColorPickerIcon,
  ImageAdd01Icon,
  Maximize01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/huge-icon";

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

function wrapStylizedTime(time: number) {
  return ((time % 100) + 100) % 100;
}

function getShortestTimeDelta(from: number, to: number) {
  const direct = to - from;
  if (Math.abs(direct) <= 50) {
    return direct;
  }

  return direct > 0 ? direct - 100 : direct + 100;
}

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

const ORIENTATION_MARKS = [0, 90, 180, 270, 360];

function TickLabels({
  items,
  formatter,
}: {
  items: readonly number[] | Array<{ label: string; value: number }>;
  formatter?: (value: number) => string;
}) {
  return (
    <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
      {items.map((item) => {
        const value = typeof item === "number" ? item : item.value;
        const label =
          typeof item === "number" ? formatter?.(item) ?? `${item}` : item.label;

        return <span key={value}>{label}</span>;
      })}
    </div>
  );
}

export const EnvironmentSettings = () => {
  const [backgroundPreviewError, setBackgroundPreviewError] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(true);
  const [speedFactor, setSpeedFactor] = React.useState(1);
  const playbackFrameRef = React.useRef<number | null>(null);
  const playbackLastTickRef = React.useRef<number | null>(null);
  const presetFrameRef = React.useRef<number | null>(null);
  const currentTimeRef = React.useRef(0);
  const backgroundColor = useEnvironmentStore((state) => state.backgroundColor);
  const setBackgroundColor = useEnvironmentStore(
    (state) => state.setBackgroundColor,
  );
  const hdrEnabled = useEnvironmentStore((state) => state.hdrEnabled);
  const setHdrEnabled = useEnvironmentStore((state) => state.setHdrEnabled);
  const showHDR = useEnvironmentStore((state) => state.showHDR);
  const setShowHDR = useEnvironmentStore((state) => state.setShowHDR);
  const hdrPath = useEnvironmentStore((state) => state.hdrPath);
  const setHdrPath = useEnvironmentStore((state) => state.setHdrPath);
  const hdrBlur = useEnvironmentStore((state) => state.hdrBlur);
  const setHdrBlur = useEnvironmentStore((state) => state.setHdrBlur);
  const hdrRotation = useEnvironmentStore((state) => state.hdrRotation);
  const setHdrRotation = useEnvironmentStore((state) => state.setHdrRotation);
  const hdrIntensity = useEnvironmentStore((state) => state.hdrIntensity);
  const setHdrIntensity = useEnvironmentStore((state) => state.setHdrIntensity);
  const backgroundImage = useEnvironmentStore((state) => state.backgroundImage);
  const setBackgroundImage = useEnvironmentStore(
    (state) => state.setBackgroundImage,
  );
  const exposure = useEnvironmentStore((state) => state.exposure);
  const setExposure = useEnvironmentStore((state) => state.setExposure);
  const toneMapping = useEnvironmentStore((state) => state.toneMapping);
  const setToneMapping = useEnvironmentStore((state) => state.setToneMapping);
  const lightingEnabled = useLightingStore((state) => state.enabled);
  const currentTime = useLightingStore((state) => state.currentTime);
  const orientation = useLightingStore((state) => state.orientation);
  const setLightingEnabled = useLightingStore((state) => state.setEnabled);
  const setCurrentTime = useLightingStore((state) => state.setCurrentTime);
  const setOrientation = useLightingStore((state) => state.setOrientation);
  const resetLighting = useLightingStore((state) => state.reset);
  const activePreset = getPresetDetails(resolveStylizedLightingPreset(currentTime));
  const throttledCurrentTime = useRafThrottledNumber(setCurrentTime);
  const throttledOrientation = useRafThrottledNumber(setOrientation);
  const throttledHdrIntensity = useRafThrottledNumber(setHdrIntensity);
  const throttledHdrRotation = useRafThrottledNumber(setHdrRotation);
  const throttledHdrBlur = useRafThrottledNumber(setHdrBlur);
  const throttledExposure = useRafThrottledNumber(setExposure);

  React.useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const cancelPlaybackAnimation = React.useCallback(() => {
    if (playbackFrameRef.current !== null) {
      cancelAnimationFrame(playbackFrameRef.current);
      playbackFrameRef.current = null;
    }
    playbackLastTickRef.current = null;
  }, []);

  const cancelPresetAnimation = React.useCallback(() => {
    if (presetFrameRef.current !== null) {
      cancelAnimationFrame(presetFrameRef.current);
      presetFrameRef.current = null;
    }
  }, []);

  const animatePresetTime = React.useCallback(
    (targetTime: number) => {
      cancelPresetAnimation();
      cancelPlaybackAnimation();
      setIsPaused(true);

      const startTime = currentTime;
      const delta = getShortestTimeDelta(startTime, targetTime);
      const duration = 520;
      let startTimestamp: number | null = null;

      const tick = (now: number) => {
        if (startTimestamp === null) {
          startTimestamp = now;
        }

        const progress = Math.min((now - startTimestamp) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrentTime(wrapStylizedTime(startTime + delta * eased));

        if (progress < 1) {
          presetFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        setCurrentTime(targetTime);
        presetFrameRef.current = null;
      };

      presetFrameRef.current = requestAnimationFrame(tick);
    },
    [cancelPlaybackAnimation, cancelPresetAnimation, currentTime, setCurrentTime],
  );

  React.useEffect(() => {
    if (!lightingEnabled || isPaused) {
      cancelPlaybackAnimation();
      return;
    }

    const tick = (now: number) => {
      const previousTick = playbackLastTickRef.current;
      playbackLastTickRef.current = now;

      if (previousTick !== null) {
        const elapsedSeconds = Math.min((now - previousTick) / 1000, 0.1);
        setCurrentTime(
          wrapStylizedTime(
            currentTimeRef.current + elapsedSeconds * speedFactor,
          ),
        );
      }

      playbackFrameRef.current = requestAnimationFrame(tick);
    };

    playbackFrameRef.current = requestAnimationFrame(tick);

    return cancelPlaybackAnimation;
  }, [
    cancelPlaybackAnimation,
    isPaused,
    lightingEnabled,
    setCurrentTime,
    speedFactor,
  ]);

  React.useEffect(() => {
    if (!lightingEnabled) {
      cancelPlaybackAnimation();
      cancelPresetAnimation();
      setIsPaused(true);
    }
  }, [cancelPlaybackAnimation, cancelPresetAnimation, lightingEnabled]);

  React.useEffect(
    () => () => {
      cancelPlaybackAnimation();
      cancelPresetAnimation();
    },
    [cancelPlaybackAnimation, cancelPresetAnimation],
  );

  const handleImageUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke the old URL if it exists to prevent memory leaks
      const previousUrl = backgroundImage
        ? getTextureRequestUrl(backgroundImage)
        : null;
      if (previousUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      const url = `${objectUrl}#${encodeURIComponent(file.name)}`;
      setBackgroundPreviewError(false);
      setBackgroundImage(url);
    }
    // Reset the input value so the same file can be uploaded again
    e.target.value = "";
  }, [backgroundImage, setBackgroundImage]);

  const handleClearImage = React.useCallback(() => {
    const requestUrl = backgroundImage
      ? getTextureRequestUrl(backgroundImage)
      : null;
    if (requestUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(requestUrl);
    }
    setBackgroundPreviewError(false);
    setBackgroundImage(null);
  }, [backgroundImage, setBackgroundImage]);

  return (
    <div className="space-y-3 px-2 overflow-y-auto flex-1 h-full min-h-0">
      {/* Background Section */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={ColorPickerIcon} className="h-4 w-4" />
            <span className="font-medium text-sm">Background</span>
          </div>
          <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
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
                  {backgroundImage && !backgroundPreviewError ? (
                    <img
                      src={backgroundImage}
                      alt="Background Preview"
                      className="w-full h-full object-cover"
                      onError={() => setBackgroundPreviewError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-muted-foreground">
                      <Icon icon={ImageAdd01Icon} className="mb-1 h-6 w-6 opacity-50" />
                      <span className="text-[10px]">
                        {backgroundImage ? "Preview unavailable" : "Upload Image / KTX2"}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.ktx2"
                    onChange={handleImageUpload}
                  />
                </label>
                {backgroundImage && (
                  <button
                    onClick={handleClearImage}
                    className="absolute -top-2 -right-2 p-1 bg-background border rounded-full shadow-sm hover:bg-destructive/10 hover:text-destructive transition-colors z-10"
                    title="Clear Background Image"
                  >
                    <Icon icon={Cancel01Icon} className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={Sun01Icon} className="h-4 w-4" />
            <span className="font-medium text-sm">Daylight Rig</span>
          </div>
          <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Stylized sunlight
                </p>
                </div>
                <Switch
                  checked={lightingEnabled}
                  onCheckedChange={(checked) => {
                    cancelPlaybackAnimation();
                    cancelPresetAnimation();
                    setLightingEnabled(checked);
                    setIsPaused(!checked);
                  }}
              />
            </div>

            {lightingEnabled ? (
              <>
                <div className="flex items-end justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      Live Time
                    </p>
                    <p className="mt-2 text-[1.15rem] font-bold leading-none tracking-[-0.03em] text-foreground">
                      {formatLightingClock(currentTime)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {activePreset.label}
                        <Icon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuRadioGroup
                        value={activePreset.value}
                        onValueChange={(value) => {
                          const selected = getPresetDetails(value as LightingPreset);
                          animatePresetTime(selected.time);
                        }}
                      >
                        {STYLIZED_LIGHTING_PRESET_OPTIONS.map((option) => {
                          return (
                            <DropdownMenuRadioItem
                              key={option.value}
                              value={option.value}
                              className="items-start py-2"
                            >
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {option.label}
                                </div>
                              </div>
                            </DropdownMenuRadioItem>
                          );
                        })}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground">
                          Time Of Day
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
                        {currentTime.toFixed(1)}
                      </span>
                    </div>

                    <div
                      className="rounded-full px-1 py-1"
                      style={{
                        background:
                          "linear-gradient(90deg, #20285a 0%, #38458a 12%, #8dbde8 28%, #ecd899 46%, #ffaf52 66%, #d86449 84%, #1f2145 100%)",
                      }}
                    >
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.1}
                        value={currentTime}
                        onChange={(event) => {
                          cancelPresetAnimation();
                          cancelPlaybackAnimation();
                          setIsPaused(true);
                          throttledCurrentTime(parseFloat(event.target.value));
                        }}
                        className="block h-5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#f6f0e4] [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.28)]"
                      />
                    </div>

                    <TickLabels items={STYLIZED_LIGHTING_TIME_MARKS} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground">
                          Room Orientation
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
                        {Math.round(orientation)}°
                      </span>
                    </div>

                    <div className="rounded-full bg-muted px-1 py-1">
                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={1}
                        value={orientation}
                        onChange={(event) => {
                          cancelPresetAnimation();
                          cancelPlaybackAnimation();
                          setIsPaused(true);
                          throttledOrientation(parseFloat(event.target.value));
                        }}
                        className="block h-5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(90deg,rgba(47,42,36,0.18),rgba(47,42,36,0.42),rgba(47,42,36,0.18))] [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#f6f0e4] [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.28)]"
                      />
                    </div>

                    <TickLabels
                      items={ORIENTATION_MARKS}
                      formatter={(value) => `${value}°`}
                    />
                  </div>

                  <div className="space-y-3 border-t border-border pt-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[0.5, 1, 2, 4].map((factor) => (
                        <Button
                          key={factor}
                          variant={speedFactor === factor ? "secondary" : "outline"}
                          size="xs"
                          onClick={() => setSpeedFactor(factor)}
                        >
                          {factor}x
                        </Button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant={isPaused ? "default" : "secondary"}
                        size="sm"
                        onClick={() => {
                          cancelPresetAnimation();
                          if (isPaused) {
                            setIsPaused(false);
                            return;
                          }

                          cancelPlaybackAnimation();
                          setIsPaused(true);
                        }}
                      >
                        {isPaused ? "Play" : "Pause"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          cancelPresetAnimation();
                          cancelPlaybackAnimation();
                          resetLighting();
                          setIsPaused(false);
                          setSpeedFactor(1);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={Sun01Icon} className="h-4 w-4" />
            <span className="font-medium text-sm">Environment (HDR)</span>
          </div>
          <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-2 px-2 pb-2">
            <div className="flex items-center justify-between py-1">
              <label className="text-xs text-muted-foreground">
                Enable HDR Environment
              </label>
              <Switch checked={hdrEnabled} onCheckedChange={setHdrEnabled} />
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="text-xs text-muted-foreground">
                Show HDR Background
              </label>
              <Switch
                checked={hdrEnabled && showHDR}
                onCheckedChange={setShowHDR}
                disabled={!hdrEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Preset</label>
              <select
                value={hdrPath}
                onChange={(e) => setHdrPath(e.target.value)}
                disabled={!hdrEnabled}
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
                  disabled={!hdrEnabled}
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
                disabled={!hdrEnabled}
                onChange={(e) =>
                  throttledHdrIntensity(parseFloat(e.target.value))
                }
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
                  disabled={!hdrEnabled}
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
                disabled={!hdrEnabled}
                onChange={(e) =>
                  throttledHdrRotation(parseFloat(e.target.value))
                }
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
                  disabled={!hdrEnabled}
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
                disabled={!hdrEnabled}
                onChange={(e) => throttledHdrBlur(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Rendering Section */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={Maximize01Icon} className="h-4 w-4" />
            <span className="font-medium text-sm">Tone Mapping</span>
          </div>
          <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
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
                onChange={(e) => throttledExposure(parseFloat(e.target.value))}
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
