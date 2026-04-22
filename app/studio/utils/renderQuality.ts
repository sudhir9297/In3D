import type { QualityPreset } from "../store/postprocessingStore";

export const QUALITY_ORDER: QualityPreset[] = [
  "performance",
  "default",
  "balanced",
  "high",
];

export const SSR_RESOLUTION_SCALE: Record<QualityPreset, number> = {
  performance: 0.5,
  default: 0.75,
  balanced: 0.75,
  high: 1,
};

export const SHADOW_MAP_SIZES: Record<QualityPreset, number> = {
  performance: 512,
  default: 1024,
  balanced: 1024,
  high: 2048,
};

export const downgradeQualityPreset = (
  preset: QualityPreset,
): QualityPreset => {
  if (preset === "high") {
    return "balanced";
  }

  return "performance";
};
