import { create } from "zustand";

export type TransformMode = "translate" | "rotate" | "scale";

interface ViewPortStore {
  showGrid: boolean;
  isEditorMode: boolean;
  transformMode: TransformMode;
  isInteracting: boolean;
  uiVersion: number;
  interactionCount: number;
  screenshotRequestId: number;
  toggleGrid: () => void;
  toggleEditorMode: (value: boolean) => void;
  setTransformMode: (mode: TransformMode) => void;
  beginInteraction: () => void;
  endInteraction: () => void;
  requestScreenshot: () => void;
}

export const useViewportStore = create<ViewPortStore>((set) => ({
  showGrid: false,
  isEditorMode: false,
  transformMode: "translate",
  isInteracting: false,
  uiVersion: 0,
  interactionCount: 0,
  screenshotRequestId: 0,
  toggleGrid: () =>
    set((state) => ({
      showGrid: !state.showGrid,
      uiVersion: state.uiVersion + 1,
    })),
  toggleEditorMode: (value) =>
    set((state) => ({
      isEditorMode: value,
      uiVersion: state.uiVersion + 1,
    })),
  setTransformMode: (mode) =>
    set((state) => ({
      transformMode: mode,
      uiVersion: state.uiVersion + 1,
    })),
  beginInteraction: () =>
    set((state) => {
      const nextCount = state.interactionCount + 1;
      return {
        interactionCount: nextCount,
        isInteracting: nextCount > 0,
        uiVersion: state.uiVersion + 1,
      };
    }),
  endInteraction: () =>
    set((state) => {
      const nextCount = Math.max(0, state.interactionCount - 1);
      return {
        interactionCount: nextCount,
        isInteracting: nextCount > 0,
        uiVersion: state.uiVersion + 1,
      };
    }),
  requestScreenshot: () =>
    set((state) => ({
      screenshotRequestId: state.screenshotRequestId + 1,
      uiVersion: state.uiVersion + 1,
    })),
}));
