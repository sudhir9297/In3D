import { create } from "zustand";

const MOBILE_BREAKPOINT = 768;

export type PostprocessingPipeline = "editor";

function getDefaultSsgiEnabled() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.innerWidth >= MOBILE_BREAKPOINT;
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
  activePipeline: PostprocessingPipeline;
  renderVersion: number;
  bloom: BloomSettings;
  ssr: SsrSettings;
  ssgi: SsgiSettings;
  setActivePipeline: (pipeline: PostprocessingPipeline) => void;
  setBloom: (value: Partial<BloomSettings>) => void;
  setSsr: (value: Partial<SsrSettings>) => void;
  setSsgi: (value: Partial<SsgiSettings>) => void;
};

export const usePostprocessingStore = create<PostprocessingState>((set) => ({
  activePipeline: "editor",
  renderVersion: 0,
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
  setActivePipeline: (activePipeline) => set(() => ({ activePipeline })),
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
