import { create } from "zustand";
import { Object3D } from "three";

export interface ModelStore {
  objects: Object3D[];
  selectedObject: Object3D | null;
  sceneVersion: number;
  selectionVersion: number;

  addObject: (object: Object3D) => void;
  removeObject: (object: Object3D) => void;
  clearObjects: () => void;
  setSelectedObject: (object: Object3D | null) => void;
}

export const useModelStore = create<ModelStore>((set) => ({
  objects: [],
  selectedObject: null,
  sceneVersion: 0,
  selectionVersion: 0,
  addObject: (object) =>
    set((state) => ({
      objects: [...state.objects, object],
      sceneVersion: state.sceneVersion + 1,
    })),
  removeObject: (object) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj !== object),
      sceneVersion: state.sceneVersion + 1,
    })),
  clearObjects: () =>
    set((state) => ({
      objects: [],
      sceneVersion: state.sceneVersion + 1,
      selectedObject: null,
      selectionVersion: state.selectionVersion + 1,
    })),
  setSelectedObject: (object) =>
    set((state) => ({
      selectedObject: object,
      selectionVersion: state.selectionVersion + 1,
    })),
}));
