import { create } from "zustand";

export interface BloomSettings {
  enabled: boolean;
  intensity: number;
  luminanceThreshold: number;
  luminanceSmoothing: number;
  mipmapBlur: boolean;
}

export interface SSAOSettings {
  enabled: boolean;
  intensity: number;
  radius: number;
  bias: number;
}

export interface VignetteSettings {
  enabled: boolean;
  offset: number;
  darkness: number;
}

export interface ChromaticAberrationSettings {
  enabled: boolean;
  offset: [number, number];
}

export interface ColorCorrectionSettings {
  enabled: boolean;
  brightness: number;
  contrast: number;
}

export interface PostprocessingState {
  bloom: BloomSettings;
  ssao: SSAOSettings;
  vignette: VignetteSettings;
  chromaticAberration: ChromaticAberrationSettings;
  colorCorrection: ColorCorrectionSettings;

  // Actions
  setBloom: (settings: Partial<BloomSettings>) => void;
  setSSAO: (settings: Partial<SSAOSettings>) => void;
  setVignette: (settings: Partial<VignetteSettings>) => void;
  setChromaticAberration: (
    settings: Partial<ChromaticAberrationSettings>,
  ) => void;
  setColorCorrection: (settings: Partial<ColorCorrectionSettings>) => void;
  resetAll: () => void;
}

const initialState = {
  bloom: {
    enabled: false,
    intensity: 0.5,
    luminanceThreshold: 0.9,
    luminanceSmoothing: 0.025,
    mipmapBlur: true,
  },
  ssao: {
    enabled: false,
    intensity: 1,
    radius: 0.1,
    bias: 0.05,
  },
  vignette: {
    enabled: false,
    offset: 0.5,
    darkness: 0.5,
  },
  chromaticAberration: {
    enabled: false,
    offset: [0.002, 0.002] as [number, number],
  },
  colorCorrection: {
    enabled: false,
    brightness: 0,
    contrast: 0,
  },
};

export const usePostprocessingStore = create<PostprocessingState>((set) => ({
  ...initialState,

  setBloom: (settings) =>
    set((state) => ({ bloom: { ...state.bloom, ...settings } })),
  setSSAO: (settings) =>
    set((state) => ({ ssao: { ...state.ssao, ...settings } })),
  setVignette: (settings) =>
    set((state) => ({ vignette: { ...state.vignette, ...settings } })),
  setChromaticAberration: (settings) =>
    set((state) => ({
      chromaticAberration: { ...state.chromaticAberration, ...settings },
    })),
  setColorCorrection: (settings) =>
    set((state) => ({
      colorCorrection: { ...state.colorCorrection, ...settings },
    })),
  resetAll: () => set(initialState),
}));
