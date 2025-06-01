import { create } from "zustand";

export interface ViewPortStore {
  showGrid: boolean;
  isEditorMode: boolean;
  toggleGrid: () => void;
  toggleEditorMode: (value: boolean) => void;
}

export const useViewportStore = create<ViewPortStore>((set) => ({
  showGrid: false,
  isEditorMode: false,
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleEditorMode: (value) => set(() => ({ isEditorMode: value })),
}));
