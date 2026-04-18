import { create } from "zustand";

const MOBILE_BREAKPOINT = 768;
const QUALITY_ORDER = ["performance", "balanced", "high"] as const;

export type QualityPreset = (typeof QUALITY_ORDER)[number];

function getDefaultSsgiEnabled() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.innerWidth >= MOBILE_BREAKPOINT;
}

function getDefaultQualityPreset(): QualityPreset {
  return "performance";
}

type BloomSettings = {
  enabled: boolean;
  strength: number;
  radius: number;
  threshold: number;
};

type SsrSettings = {
  enabled: boolean;
  maxDistance: number;
  blurQuality: number;
  thickness: number;
};

type SsgiSettings = {
  enabled: boolean;
  sliceCount: number;
  stepCount: number;
  radius: number;
  giIntensity: number;
  aoIntensity: number;
  thickness: number;
};

type PostprocessingState = {
  qualityPreset: QualityPreset;
  autoQuality: boolean;
  renderVersion: number;
  bloom: BloomSettings;
  ssr: SsrSettings;
  ssgi: SsgiSettings;
  setQualityPreset: (preset: QualityPreset) => void;
  setAutoQuality: (autoQuality: boolean) => void;
  lowerQuality: () => void;
  raiseQuality: () => void;
  setBloom: (value: Partial<BloomSettings>) => void;
  setSsr: (value: Partial<SsrSettings>) => void;
  setSsgi: (value: Partial<SsgiSettings>) => void;
};

const QUALITY_PRESETS: Record<
  QualityPreset,
  Pick<PostprocessingState, "bloom" | "ssr" | "ssgi">
> = {
  performance: {
    bloom: {
      enabled: false,
      strength: 0.06,
      radius: 0.55,
      threshold: 1,
    },
    ssr: {
      enabled: false,
      maxDistance: 3,
      blurQuality: 0,
      thickness: 0.1,
    },
    ssgi: {
      enabled: false,
      sliceCount: 1,
      stepCount: 4,
      radius: 0.6,
      giIntensity: 0.35,
      aoIntensity: 1,
      thickness: 0.35,
    },
  },
  balanced: {
    bloom: {
      enabled: true,
      strength: 0.1,
      radius: 0.8,
      threshold: 0.9,
    },
    ssr: {
      enabled: true,
      maxDistance: 4,
      blurQuality: 1,
      thickness: 0.12,
    },
    ssgi: {
      enabled: false,
      sliceCount: 2,
      stepCount: 8,
      radius: 1,
      giIntensity: 0.5,
      aoIntensity: 1.5,
      thickness: 0.5,
    },
  },
  high: {
    bloom: {
      enabled: true,
      strength: 0.14,
      radius: 0.95,
      threshold: 0.85,
    },
    ssr: {
      enabled: true,
      maxDistance: 5,
      blurQuality: 1,
      thickness: 0.15,
    },
    ssgi: {
      enabled: getDefaultSsgiEnabled(),
      sliceCount: 2,
      stepCount: 8,
      radius: 1,
      giIntensity: 0.5,
      aoIntensity: 1.5,
      thickness: 0.5,
    },
  },
};

const applyQualityPreset = (preset: QualityPreset) => ({
  qualityPreset: preset,
  ...QUALITY_PRESETS[preset],
});

const getNextQualityPreset = (
  current: QualityPreset,
  direction: -1 | 1,
): QualityPreset => {
  const currentIndex = QUALITY_ORDER.indexOf(current);
  const nextIndex = Math.min(
    QUALITY_ORDER.length - 1,
    Math.max(0, currentIndex + direction),
  );

  return QUALITY_ORDER[nextIndex];
};

export const usePostprocessingStore = create<PostprocessingState>((set) => ({
  renderVersion: 0,
  autoQuality: false,
  ...applyQualityPreset(getDefaultQualityPreset()),
  setQualityPreset: (qualityPreset) =>
    set((state) => ({
      ...applyQualityPreset(qualityPreset),
      renderVersion: state.renderVersion + 1,
    })),
  setAutoQuality: (autoQuality) =>
    set((state) => ({ autoQuality, renderVersion: state.renderVersion + 1 })),
  lowerQuality: () =>
    set((state) => ({
      ...applyQualityPreset(getNextQualityPreset(state.qualityPreset, -1)),
      renderVersion: state.renderVersion + 1,
    })),
  raiseQuality: () =>
    set((state) => ({
      ...applyQualityPreset(getNextQualityPreset(state.qualityPreset, 1)),
      renderVersion: state.renderVersion + 1,
    })),
  setBloom: (value) =>
    set((state) => ({
      bloom: { ...state.bloom, ...value },
      renderVersion: state.renderVersion + 1,
    })),
  setSsr: (value) =>
    set((state) => ({
      ssr: { ...state.ssr, ...value },
      renderVersion: state.renderVersion + 1,
    })),
  setSsgi: (value) =>
    set((state) => ({
      ssgi: { ...state.ssgi, ...value },
      renderVersion: state.renderVersion + 1,
    })),
}));
