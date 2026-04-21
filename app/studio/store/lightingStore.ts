import { create } from "zustand";
import {
  clampStylizedLightingTime,
  getPresetDetails,
  LightingPreset,
  resolveStylizedLightingPreset,
} from "../utils/stylizedLighting";

export type { LightingPreset } from "../utils/stylizedLighting";

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
  currentTime: 24,
  preset: "morning" as LightingPreset,
  orientation: 90,
};

export const useLightingStore = create<LightingStore>((set) => ({
  ...initialState,
  renderVersion: 0,
  setEnabled: (enabled) =>
    set((state) => ({ enabled, renderVersion: state.renderVersion + 1 })),
  setCurrentTime: (currentTime) =>
    set((state) => ({
      currentTime: clampStylizedLightingTime(currentTime),
      preset: resolveStylizedLightingPreset(currentTime),
      renderVersion: state.renderVersion + 1,
    })),
  setPreset: (preset) =>
    set((state) => ({
      preset,
      currentTime: getPresetDetails(preset).time,
      renderVersion: state.renderVersion + 1,
    })),
  setOrientation: (orientation) =>
    set((state) => ({
      orientation: Math.min(360, Math.max(0, orientation)),
      renderVersion: state.renderVersion + 1,
    })),
  reset: () => set((state) => ({ ...initialState, renderVersion: state.renderVersion + 1 })),
}));
