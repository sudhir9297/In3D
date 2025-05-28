import { create } from "zustand";
import { Object3D } from "three";

export interface ModelStore {
  objects: Object3D[];
  selectedObject: Object3D | null;

  addObject: (object: Object3D) => void;
  removeObject: (object: Object3D) => void;
  clearObjects: () => void;
  setSelectedObject: (object: Object3D | null) => void;
}

export const useModelStore = create<ModelStore>((set) => ({
  objects: [],
  selectedObject: null,
  addObject: (object) =>
    set((state) => ({
      objects: [...state.objects, object],
    })),
  removeObject: (object) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj !== object),
    })),
  clearObjects: () => set({ objects: [] }),
  setSelectedObject: (object) => set({ selectedObject: object }),
}));
