import { create } from "zustand";
import { Object3D } from "three";

// Types for texture map info
export interface TextureMapInfo {
  thumbnail: string;
  map: string;
  use: boolean;
  repeatX: number;
  repeatY: number;
  rotation: number;
  wrapS: string;
  wrapT: string;
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

interface MaterialStore {
  // Current mesh reference
  selectedMesh: Object3D | null;
  renderVersion: number;

  // Material data
  maps: MaterialMaps;
  mapProperties: MapProperties;
  initialMaps: MaterialMaps;
  initialMapProperties: MapProperties;

  // Actions
  setSelectedMesh: (mesh: Object3D | null) => void;
  setMaps: (maps: Partial<MaterialMaps>) => void;
  setLocalMapProperties: (
    mapKey: keyof MaterialMaps,
    props: Partial<TextureMapInfo>,
  ) => void;
  setMapProperties: (props: Partial<MapProperties>) => void;
  setMaterial: (maps: MaterialMaps, props: MapProperties) => void;
  resetMapState: (mapKey: keyof MaterialMaps) => void;
  resetMaterialState: () => void;
  clearMaterial: () => void;
}

// Default values
const defaultMapInfo: TextureMapInfo = {
  thumbnail: "",
  map: "",
  use: true,
  repeatX: 8,
  repeatY: 8,
  rotation: 0,
  wrapS: "Repeat",
  wrapT: "Repeat",
};

const defaultMaps: MaterialMaps = {
  albedoMap: { ...defaultMapInfo },
  metalnessMap: { ...defaultMapInfo },
  roughnessMap: { ...defaultMapInfo },
  normalMap: { ...defaultMapInfo },
  displacementMap: { ...defaultMapInfo },
  aoMap: { ...defaultMapInfo, repeatX: 1, repeatY: 1 }, // AO usually 1:1
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
  renderVersion: 0,
  maps: { ...defaultMaps },
  mapProperties: { ...defaultMapProperties },
  initialMaps: { ...defaultMaps },
  initialMapProperties: { ...defaultMapProperties },

  setSelectedMesh: (mesh) =>
    set((state) => ({
      selectedMesh: mesh,
      renderVersion: state.renderVersion + 1,
    })),

  setMaps: (maps) =>
    set((state) => ({
      maps: { ...state.maps, ...maps },
      renderVersion: state.renderVersion + 1,
    })),

  setLocalMapProperties: (mapKey, props) =>
    set((state) => ({
      maps: {
        ...state.maps,
        [mapKey]: { ...state.maps[mapKey], ...props },
      },
      renderVersion: state.renderVersion + 1,
    })),

  setMapProperties: (props) =>
    set((state) => {
      const newMapProperties = { ...state.mapProperties, ...props };

      // If global texture properties changed, update all maps EXCEPT aoMap
      const texturePropsToSync: (keyof TextureMapInfo)[] = [
        "repeatX",
        "repeatY",
        "rotation",
        "wrapS",
        "wrapT",
      ];

      const changedProps = Object.keys(props).filter((k) =>
        texturePropsToSync.includes(k as any),
      );

      if (changedProps.length > 0) {
        const newMaps = { ...state.maps };
        Object.keys(newMaps).forEach((key) => {
          if (key === "aoMap") return; // Skip AO map

          const mapKey = key as keyof MaterialMaps;
          newMaps[mapKey] = {
            ...newMaps[mapKey],
            ...props,
          };
        });
        return {
          mapProperties: newMapProperties,
          maps: newMaps,
          renderVersion: state.renderVersion + 1,
        };
      }

      return {
        mapProperties: newMapProperties,
        renderVersion: state.renderVersion + 1,
      };
    }),

  setMaterial: (maps, props) =>
    set((state) => ({
      maps,
      mapProperties: props,
      initialMaps: maps,
      initialMapProperties: props,
      renderVersion: state.renderVersion + 1,
    })),

  resetMapState: (mapKey) =>
    set((state) => ({
      maps: {
        ...state.maps,
        [mapKey]: { ...state.initialMaps[mapKey] },
      },
      renderVersion: state.renderVersion + 1,
    })),

  resetMaterialState: () =>
    set((state) => ({
      maps: { ...state.initialMaps },
      mapProperties: { ...state.initialMapProperties },
      renderVersion: state.renderVersion + 1,
    })),

  clearMaterial: () =>
    set((state) => ({
      selectedMesh: null,
      maps: { ...defaultMaps },
      mapProperties: { ...defaultMapProperties },
      initialMaps: { ...defaultMaps },
      initialMapProperties: { ...defaultMapProperties },
      renderVersion: state.renderVersion + 1,
    })),
}));

// Export defaults for use in extraction
export { defaultMaps, defaultMapProperties };
