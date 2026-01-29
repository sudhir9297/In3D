import { create } from "zustand";
import { Object3D } from "three";

// Types for texture map info
export interface TextureMapInfo {
  thumbnail: string;
  map: string;
  use: boolean;
}

export interface MaterialMaps {
  albedoMap: TextureMapInfo;
  metalnessMap: TextureMapInfo;
  roughnessMap: TextureMapInfo;
  normalMap: TextureMapInfo;
  displacementMap: TextureMapInfo;
  aoMap: TextureMapInfo;
  emissiveMap: TextureMapInfo;
  bumpMap: TextureMapInfo;
  alphaMap: TextureMapInfo;
  lightMap: TextureMapInfo;
}

export interface MapProperties {
  color: string;
  roughness: number;
  metalness: number;
  repeatX: number;
  repeatY: number;
  normalScaleX: number;
  normalScaleY: number;
  wrapT: string;
  wrapS: string;
  emissiveIntensity: number;
  displacementScale: number;
  transparent: boolean;
  flipY: boolean;
  bumpScale: number;
  emissiveColor: string;
  aoMapIntensity: number;
  side: number;
  rotation: number;
  opacity: number;
  lightMapIntensity: number;
}

export interface MaterialStore {
  // Current mesh reference
  selectedMesh: Object3D | null;

  // Material data
  maps: MaterialMaps;
  mapProperties: MapProperties;

  // Actions
  setSelectedMesh: (mesh: Object3D | null) => void;
  setMaps: (maps: Partial<MaterialMaps>) => void;
  setMapProperties: (props: Partial<MapProperties>) => void;
  setMaterial: (maps: MaterialMaps, props: MapProperties) => void;
  clearMaterial: () => void;
}

// Default values
const defaultMapInfo: TextureMapInfo = {
  thumbnail: "",
  map: "",
  use: true,
};

const defaultMaps: MaterialMaps = {
  albedoMap: { ...defaultMapInfo },
  metalnessMap: { ...defaultMapInfo },
  roughnessMap: { ...defaultMapInfo },
  normalMap: { ...defaultMapInfo },
  displacementMap: { ...defaultMapInfo },
  aoMap: { ...defaultMapInfo },
  emissiveMap: { ...defaultMapInfo },
  bumpMap: { ...defaultMapInfo },
  alphaMap: { ...defaultMapInfo },
  lightMap: { ...defaultMapInfo },
};

const defaultMapProperties: MapProperties = {
  color: "#FFFFFF",
  roughness: 0.6,
  metalness: 0.00001,
  repeatX: 8,
  repeatY: 8,
  normalScaleX: 1,
  normalScaleY: 1,
  wrapT: "Repeat",
  wrapS: "Repeat",
  emissiveIntensity: 1,
  displacementScale: 0.02,
  transparent: true,
  flipY: true,
  bumpScale: 1,
  emissiveColor: "#000000",
  aoMapIntensity: 1,
  side: 0,
  rotation: 0,
  opacity: 1,
  lightMapIntensity: 1,
};

export const useMaterialStore = create<MaterialStore>((set) => ({
  selectedMesh: null,
  maps: { ...defaultMaps },
  mapProperties: { ...defaultMapProperties },

  setSelectedMesh: (mesh) => set({ selectedMesh: mesh }),

  setMaps: (maps) =>
    set((state) => ({
      maps: { ...state.maps, ...maps },
    })),

  setMapProperties: (props) =>
    set((state) => ({
      mapProperties: { ...state.mapProperties, ...props },
    })),

  setMaterial: (maps, props) =>
    set({
      maps,
      mapProperties: props,
    }),

  clearMaterial: () =>
    set({
      selectedMesh: null,
      maps: { ...defaultMaps },
      mapProperties: { ...defaultMapProperties },
    }),
}));

// Export defaults for use in extraction
export { defaultMaps, defaultMapProperties };
