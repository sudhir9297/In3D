import { create } from "zustand";

export type ToneMappingMode =
  | "None"
  | "Linear"
  | "Reinhard"
  | "Cineon"
  | "ACESFilmic"
  | "AgX"
  | "Neutral";

export interface EnvironmentState {
  backgroundColor: string;
  showHDR: boolean;
  hdrPath: string;
  hdrBlur: number;
  hdrRotation: number;
  hdrIntensity: number;
  fogEnabled: boolean;
  fogColor: string;
  fogDensity: number;
  ambientIntensity: number;
  ambientColor: string;
  backgroundImage: string | null;
  exposure: number;
  toneMapping: ToneMappingMode;

  // Actions
  setBackgroundColor: (color: string) => void;
  setShowHDR: (show: boolean) => void;
  setHdrPath: (path: string) => void;
  setHdrBlur: (blur: number) => void;
  setHdrRotation: (rotation: number) => void;
  setHdrIntensity: (intensity: number) => void;
  setFogEnabled: (enabled: boolean) => void;
  setFogColor: (color: string) => void;
  setFogDensity: (density: number) => void;
  setAmbientIntensity: (intensity: number) => void;
  setAmbientColor: (color: string) => void;
  setBackgroundImage: (image: string | null) => void;
  setExposure: (exposure: number) => void;
  setToneMapping: (mode: ToneMappingMode) => void;
  reset: () => void;
}

const initialState = {
  backgroundColor: "#f2f2f2",
  showHDR: false,
  hdrPath: "apartment",
  hdrBlur: 0.1,
  hdrRotation: 0,
  hdrIntensity: 1.0,
  fogEnabled: false,
  fogColor: "#ffffff",
  fogDensity: 0.005,
  ambientIntensity: 0.5,
  ambientColor: "#ffffff",
  backgroundImage: null,
  exposure: 1.0,
  toneMapping: "ACESFilmic" as ToneMappingMode,
};

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  ...initialState,

  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  setShowHDR: (showHDR) => set({ showHDR }),
  setHdrPath: (hdrPath) => set({ hdrPath }),
  setHdrBlur: (hdrBlur) => set({ hdrBlur }),
  setHdrRotation: (hdrRotation) => set({ hdrRotation }),
  setHdrIntensity: (hdrIntensity) => set({ hdrIntensity }),
  setFogEnabled: (fogEnabled) => set({ fogEnabled }),
  setFogColor: (fogColor) => set({ fogColor }),
  setFogDensity: (fogDensity) => set({ fogDensity }),
  setAmbientIntensity: (ambientIntensity) => set({ ambientIntensity }),
  setAmbientColor: (ambientColor) => set({ ambientColor }),
  setBackgroundImage: (backgroundImage) => set({ backgroundImage }),
  setExposure: (exposure) => set({ exposure }),
  setToneMapping: (toneMapping) => set({ toneMapping }),

  reset: () => set(initialState),
}));
