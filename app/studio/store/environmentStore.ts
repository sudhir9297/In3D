import { create } from "zustand";

export type ToneMappingMode =
  | "None"
  | "Linear"
  | "Reinhard"
  | "Cineon"
  | "ACESFilmic"
  | "AgX"
  | "Neutral";

interface EnvironmentState {
  renderVersion: number;
  backgroundColor: string;
  hdrEnabled: boolean;
  showHDR: boolean;
  hdrPath: string;
  hdrBlur: number;
  hdrRotation: number;
  hdrIntensity: number;
  backgroundImage: string | null;
  exposure: number;
  toneMapping: ToneMappingMode;

  // Actions
  setBackgroundColor: (color: string) => void;
  setHdrEnabled: (enabled: boolean) => void;
  setShowHDR: (show: boolean) => void;
  setHdrPath: (path: string) => void;
  setHdrBlur: (blur: number) => void;
  setHdrRotation: (rotation: number) => void;
  setHdrIntensity: (intensity: number) => void;
  setBackgroundImage: (image: string | null) => void;
  setExposure: (exposure: number) => void;
  setToneMapping: (mode: ToneMappingMode) => void;
  reset: () => void;
}

const initialState = {
  backgroundColor: "#f2f2f2",
  hdrEnabled: true,
  showHDR: false,
  hdrPath: "apartment",
  hdrBlur: 0.1,
  hdrRotation: 0,
  hdrIntensity: 1.0,
  backgroundImage: null,
  exposure: 1.0,
  toneMapping: "ACESFilmic" as ToneMappingMode,
};

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  renderVersion: 0,
  ...initialState,

  setBackgroundColor: (backgroundColor) =>
    set((state) => ({ backgroundColor, renderVersion: state.renderVersion + 1 })),
  setHdrEnabled: (hdrEnabled) =>
    set((state) => ({ hdrEnabled, renderVersion: state.renderVersion + 1 })),
  setShowHDR: (showHDR) =>
    set((state) => ({ showHDR, renderVersion: state.renderVersion + 1 })),
  setHdrPath: (hdrPath) =>
    set((state) => ({ hdrPath, renderVersion: state.renderVersion + 1 })),
  setHdrBlur: (hdrBlur) =>
    set((state) => ({ hdrBlur, renderVersion: state.renderVersion + 1 })),
  setHdrRotation: (hdrRotation) =>
    set((state) => ({ hdrRotation, renderVersion: state.renderVersion + 1 })),
  setHdrIntensity: (hdrIntensity) =>
    set((state) => ({ hdrIntensity, renderVersion: state.renderVersion + 1 })),
  setBackgroundImage: (backgroundImage) =>
    set((state) => ({
      backgroundImage,
      renderVersion: state.renderVersion + 1,
    })),
  setExposure: (exposure) =>
    set((state) => ({ exposure, renderVersion: state.renderVersion + 1 })),
  setToneMapping: (toneMapping) =>
    set((state) => ({ toneMapping, renderVersion: state.renderVersion + 1 })),

  reset: () => set((state) => ({ ...initialState, renderVersion: state.renderVersion + 1 })),
}));
