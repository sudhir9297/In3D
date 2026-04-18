import { create } from "zustand";

export type LightingPreset =
  | "dawn"
  | "golden"
  | "morning"
  | "brunch"
  | "dusk";

interface LightingStore {
  enabled: boolean;
  currentTime: number;
  preset: LightingPreset;
  orientation: number;
  renderVersion: number;
  setEnabled: (enabled: boolean) => void;
  setCurrentTime: (time: number) => void;
  setPreset: (preset: LightingPreset) => void;
  setOrientation: (orientation: number) => void;
  reset: () => void;
}

const initialState = {
  enabled: false,
  currentTime: 4,
  preset: "dawn" as LightingPreset,
  orientation: 90,
};

export const useLightingStore = create<LightingStore>((set) => ({
  ...initialState,
  renderVersion: 0,
  setEnabled: (enabled) =>
    set((state) => ({ enabled, renderVersion: state.renderVersion + 1 })),
  setCurrentTime: (currentTime) =>
    set((state) => ({
      currentTime: Math.min(100, Math.max(0, currentTime)),
      renderVersion: state.renderVersion + 1,
    })),
  setPreset: (preset) =>
    set((state) => ({ preset, renderVersion: state.renderVersion + 1 })),
  setOrientation: (orientation) =>
    set((state) => ({
      orientation: Math.min(360, Math.max(0, orientation)),
      renderVersion: state.renderVersion + 1,
    })),
  reset: () => set((state) => ({ ...initialState, renderVersion: state.renderVersion + 1 })),
}));
