import { create } from "zustand";

const MOBILE_BREAKPOINT = 768;

function getDefaultSsgiEnabled() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.innerWidth >= MOBILE_BREAKPOINT;
}

export type BloomSettings = {
  enabled: boolean;
  strength: number;
  radius: number;
  threshold: number;
};

export type SsrSettings = {
  enabled: boolean;
  maxDistance: number;
  blurQuality: number;
  thickness: number;
};

export type SsgiSettings = {
  enabled: boolean;
  sliceCount: number;
  stepCount: number;
  radius: number;
  giIntensity: number;
  aoIntensity: number;
  thickness: number;
};

type PostprocessingState = {
  bloom: BloomSettings;
  ssr: SsrSettings;
  ssgi: SsgiSettings;
  setBloom: (value: Partial<BloomSettings>) => void;
  setSsr: (value: Partial<SsrSettings>) => void;
  setSsgi: (value: Partial<SsgiSettings>) => void;
};

export const usePostprocessingStore = create<PostprocessingState>((set) => ({
  bloom: {
    enabled: false,
    strength: 0.1,
    radius: 0.8,
    threshold: 0.9,
  },
  ssr: {
    enabled: false,
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
  setBloom: (value) =>
    set((state) => ({
      bloom: { ...state.bloom, ...value },
    })),
  setSsr: (value) =>
    set((state) => ({
      ssr: { ...state.ssr, ...value },
    })),
  setSsgi: (value) =>
    set((state) => ({
      ssgi: { ...state.ssgi, ...value },
    })),
}));
