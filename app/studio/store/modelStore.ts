import { create } from "zustand";
import { Object3D } from "three";

interface ModelStore {
  objects: Object3D[];
  addObject: (object: Object3D) => void;
  removeObject: (object: Object3D) => void;
  clearObjects: () => void;
}

export const useModelStore = create<ModelStore>((set) => ({
  objects: [],
  addObject: (object) =>
    set((state) => ({
      objects: [...state.objects, object],
    })),
  removeObject: (object) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj !== object),
    })),
  clearObjects: () => set({ objects: [] }),
}));
