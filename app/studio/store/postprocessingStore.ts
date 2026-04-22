import { create } from "zustand";

const MOBILE_BREAKPOINT = 768;
const QUALITY_ORDER = ["performance", "default", "balanced", "high"] as const;

export type QualityPreset = (typeof QUALITY_ORDER)[number];
export type PostprocessingPipeline = "legacy" | "n8ao";

function getDefaultSsgiEnabled() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.innerWidth >= MOBILE_BREAKPOINT;
}

function getDefaultQualityPreset(): QualityPreset {
  return "default";
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

type N8aoSettings = {
  enabled: boolean;
  aoRadius: number;
  intensity: number;
  distanceFalloff: number;
  screenSpaceRadius: boolean;
};

type PostprocessingState = {
  activePipeline: PostprocessingPipeline;
  qualityPreset: QualityPreset;
  autoQuality: boolean;
  renderVersion: number;
  bloom: BloomSettings;
  ssr: SsrSettings;
  ssgi: SsgiSettings;
  n8ao: N8aoSettings;
  setQualityPreset: (preset: QualityPreset) => void;
  setActivePipeline: (pipeline: PostprocessingPipeline) => void;
  setAutoQuality: (autoQuality: boolean) => void;
  lowerQuality: () => void;
  raiseQuality: () => void;
  setBloom: (value: Partial<BloomSettings>) => void;
  setSsr: (value: Partial<SsrSettings>) => void;
  setSsgi: (value: Partial<SsgiSettings>) => void;
  setN8ao: (value: Partial<N8aoSettings>) => void;
};

const QUALITY_PRESETS: Record<
  QualityPreset,
  Pick<PostprocessingState, "bloom" | "ssr" | "ssgi" | "n8ao">
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
      enabled: getDefaultSsgiEnabled(),
      sliceCount: 2,
      stepCount: 8,
      radius: 1,
      giIntensity: 0.5,
      aoIntensity: 1.5,
      thickness: 0.5,
    },
    n8ao: {
      enabled: true,
      aoRadius: 20,
      intensity: 3,
      distanceFalloff: 1,
      screenSpaceRadius: true,
    },
  },
  default: {
    bloom: {
      enabled: false,
      strength: 0.1,
      radius: 0.8,
      threshold: 0.9,
    },
    ssr: {
      enabled: false,
      maxDistance: 4,
      blurQuality: 1,
      thickness: 0.12,
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
    n8ao: {
      enabled: true,
      aoRadius: 28,
      intensity: 4,
      distanceFalloff: 1,
      screenSpaceRadius: true,
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
      enabled: getDefaultSsgiEnabled(),
      sliceCount: 2,
      stepCount: 8,
      radius: 1,
      giIntensity: 0.5,
      aoIntensity: 1.5,
      thickness: 0.5,
    },
    n8ao: {
      enabled: true,
      aoRadius: 28,
      intensity: 4,
      distanceFalloff: 1,
      screenSpaceRadius: true,
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
    n8ao: {
      enabled: true,
      aoRadius: 36,
      intensity: 5,
      distanceFalloff: 1,
      screenSpaceRadius: true,
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
  activePipeline: "legacy",
  renderVersion: 0,
  autoQuality: false,
  ...applyQualityPreset(getDefaultQualityPreset()),
  setActivePipeline: (activePipeline) => set(() => ({ activePipeline })),
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
  setN8ao: (value) =>
    set((state) => ({
      n8ao: { ...state.n8ao, ...value },
      renderVersion: state.renderVersion + 1,
    })),
}));
