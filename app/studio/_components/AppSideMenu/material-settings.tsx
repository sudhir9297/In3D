"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  useMaterialStore,
  MapProperties,
  MaterialMaps,
  TextureMapInfo,
} from "../../store/materialStore";
import { useModelStore } from "../../store/modelStore";
import {
  applyMaterialProperties,
  updateMeshTexture,
  textureToDataURL,
} from "../../utils/common";
import {
  clearManagedTextureCache,
  createManagedTextureSource,
  loadConfiguredTexture,
  revokeBlobTextureUrl,
} from "../../utils/textureManager";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import {
  ArrowDown01Icon,
  ArrowReloadHorizontalIcon,
  ColorPickerIcon,
  GlobeIcon,
  Image01Icon,
  Upload01Icon,
  Cancel01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import {
  ClampToEdgeWrapping,
  MirroredRepeatWrapping,
  RepeatWrapping,
} from "three";
import { Icon } from "@/components/ui/huge-icon";

const useRafThrottledCallback = <T,>(callback: (value: T) => void) => {
  const frameRef = React.useRef<number | null>(null);
  const latestRef = React.useRef<T | null>(null);

  React.useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return React.useCallback(
    (value: T) => {
      latestRef.current = value;
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        if (latestRef.current !== null) {
          callback(latestRef.current);
        }
      });
    },
    [callback],
  );
};

// Map Section Config
const mapSections: {
  key: keyof MaterialMaps;
  label: string;
  properties: (keyof MapProperties)[];
}[] = [
  { key: "albedoMap", label: "Albedo / Base Map", properties: ["color"] },
  { key: "roughnessMap", label: "Roughness Map", properties: ["roughness"] },
  { key: "metalnessMap", label: "Metalness Map", properties: ["metalness"] },
  {
    key: "normalMap",
    label: "Normal Map",
    properties: ["normalScaleX", "normalScaleY"],
  },
  { key: "aoMap", label: "Ambient Occlusion", properties: ["aoMapIntensity"] },
  {
    key: "emissiveMap",
    label: "Emissive Map",
    properties: ["emissiveColor", "emissiveIntensity"],
  },
  {
    key: "displacementMap",
    label: "Displacement Map",
    properties: ["displacementScale"],
  },
  { key: "bumpMap", label: "Bump Map", properties: ["bumpScale"] },
  {
    key: "alphaMap",
    label: "Alpha Map",
    properties: ["opacity", "transparent"],
  },
  {
    key: "lightMap",
    label: "Light Map",
    properties: ["lightMapIntensity"],
  },
];

const surfaceProperties: (keyof MapProperties)[] = [
  "color",
  "roughness",
  "metalness",
  "opacity",
];

const globalTransformProperties: (keyof MapProperties)[] = [
  "repeatX",
  "repeatY",
  "rotation",
  "wrapS",
  "wrapT",
  "flipY",
];

const advancedSections: Array<{
  label: string;
  properties: (keyof MapProperties)[];
}> = [
  {
    label: "Normals",
    properties: ["normalScaleX", "normalScaleY"],
  },
  {
    label: "Occlusion",
    properties: ["aoMapIntensity"],
  },
  {
    label: "Emission",
    properties: ["emissiveColor", "emissiveIntensity"],
  },
  {
    label: "Displacement",
    properties: ["displacementScale"],
  },
  {
    label: "Bump",
    properties: ["bumpScale"],
  },
  {
    label: "Lighting",
    properties: ["lightMapIntensity"],
  },
  {
    label: "Material Options",
    properties: ["transparent", "side"],
  },
];

const getWrapModeValue = (wrap: string) => {
  switch (wrap) {
    case "ClampToEdge":
      return ClampToEdgeWrapping;
    case "MirroredRepeat":
      return MirroredRepeatWrapping;
    default:
      return RepeatWrapping;
  }
};

const getTextureSource = (mapInfo: TextureMapInfo) =>
  mapInfo.map || mapInfo.thumbnail;

// Property configurations
const propertyConfig: Record<
  string,
  {
    label: string;
    type: "slider" | "color" | "select" | "toggle";
    min?: number;
    max?: number;
    step?: number;
    options?: { value: string | number; label: string }[];
  }
> = {
  color: { label: "Color", type: "color" },
  emissiveColor: { label: "Emissive Color", type: "color" },
  roughness: { label: "Roughness", type: "slider", min: 0, max: 1, step: 0.01 },
  metalness: { label: "Metalness", type: "slider", min: 0, max: 1, step: 0.01 },
  opacity: { label: "Opacity", type: "slider", min: 0, max: 1, step: 0.01 },
  normalScaleX: {
    label: "Normal Scale X",
    type: "slider",
    min: -2,
    max: 2,
    step: 0.1,
  },
  normalScaleY: {
    label: "Normal Scale Y",
    type: "slider",
    min: -2,
    max: 2,
    step: 0.1,
  },
  bumpScale: {
    label: "Bump Scale",
    type: "slider",
    min: 0,
    max: 2,
    step: 0.01,
  },
  displacementScale: {
    label: "Displacement Scale",
    type: "slider",
    min: 0,
    max: 1,
    step: 0.001,
  },
  emissiveIntensity: {
    label: "Emissive Intensity",
    type: "slider",
    min: 0,
    max: 5,
    step: 0.1,
  },
  aoMapIntensity: {
    label: "AO Intensity",
    type: "slider",
    min: 0,
    max: 2,
    step: 0.1,
  },
  lightMapIntensity: {
    label: "Light Intensity",
    type: "slider",
    min: 0,
    max: 2,
    step: 0.1,
  },
  repeatX: { label: "Repeat X", type: "slider", min: 0.1, max: 20, step: 0.1 },
  repeatY: { label: "Repeat Y", type: "slider", min: 0.1, max: 20, step: 0.1 },
  rotation: {
    label: "Rotation",
    type: "slider",
    min: 0,
    max: 6.28,
    step: 0.01,
  },
  wrapS: {
    label: "Wrap S",
    type: "select",
    options: [
      { value: "Repeat", label: "Repeat" },
      { value: "ClampToEdge", label: "Clamp" },
      { value: "MirroredRepeat", label: "Mirror" },
    ],
  },
  wrapT: {
    label: "Wrap T",
    type: "select",
    options: [
      { value: "Repeat", label: "Repeat" },
      { value: "ClampToEdge", label: "Clamp" },
      { value: "MirroredRepeat", label: "Mirror" },
    ],
  },
  side: {
    label: "Side",
    type: "select",
    options: [
      { value: 0, label: "Front" },
      { value: 1, label: "Back" },
      { value: 2, label: "Double" },
    ],
  },
  transparent: { label: "Transparent", type: "toggle" },
  flipY: { label: "Flip Y", type: "toggle" },
};

export const MaterialSettings = () => {
  const maps = useMaterialStore((state) => state.maps);
  const mapProperties = useMaterialStore((state) => state.mapProperties);
  const selectedMesh = useMaterialStore((state) => state.selectedMesh);
  const initialMaps = useMaterialStore((state) => state.initialMaps);
  const initialMapProperties = useMaterialStore(
    (state) => state.initialMapProperties,
  );
  const setMapProperties = useMaterialStore((state) => state.setMapProperties);
  const setLocalMapProperties = useMaterialStore(
    (state) => state.setLocalMapProperties,
  );
  const resetMapState = useMaterialStore((state) => state.resetMapState);
  const resetMaterialState = useMaterialStore(
    (state) => state.resetMaterialState,
  );
  const selectedObject = useModelStore((state) => state.selectedObject);
  const canEditMaterial = Boolean(selectedMesh);

  const applyTextureSnapshot = async (
    mapKey: keyof MaterialMaps,
    mapInfo: TextureMapInfo,
    props: MapProperties,
  ) => {
    if (!selectedMesh) {
      return;
    }

    if (!mapInfo.use) {
      updateMeshTexture(selectedMesh, mapKey, null);
      return;
    }

    const source = getTextureSource(mapInfo);
    if (!source) {
      return;
    }

    try {
      const texture = await loadConfiguredTexture(
        source,
        mapInfo,
        props,
        getWrapModeValue,
      );
      updateMeshTexture(selectedMesh, mapKey, texture);
    } catch (error) {
      console.warn(`Failed to restore ${mapKey} texture`, error);
      updateMeshTexture(selectedMesh, mapKey, null);
    }
  };

  const applyMaterialSnapshot = async (
    nextMaps: MaterialMaps,
    nextProps: MapProperties,
  ) => {
    if (!selectedMesh) {
      return;
    }

    applyMaterialProperties(selectedMesh, nextProps);
    await Promise.all(
      mapSections.map((section) =>
        applyTextureSnapshot(section.key, nextMaps[section.key], nextProps),
      ),
    );
  };

  // Handle property change
  const handlePropertyChange = (
    key: keyof MapProperties,
    value: MapProperties[keyof MapProperties],
  ) => {
    setMapProperties({ [key]: value });

    // Apply to mesh in real-time
    if (selectedMesh) {
      applyMaterialProperties(selectedMesh, { [key]: value });
    }
  };

  // Handle local map property change
  const handleLocalPropertyChange = (
    mapKey: keyof MaterialMaps,
    key: string,
    value: any,
  ) => {
    setLocalMapProperties(mapKey, { [key]: value });

    // Apply to mesh in real-time targetting only this map
    if (selectedMesh) {
      applyMaterialProperties(selectedMesh, { [key]: value }, mapKey);
    }
  };

  const handleResetMap = async (
    mapKey: keyof MaterialMaps,
    properties: (keyof MapProperties)[],
  ) => {
    const initialMap = initialMaps[mapKey];
    const currentMap = maps[mapKey];
    if (
      currentMap.map &&
      currentMap.map !== initialMap.map &&
      currentMap.map.startsWith("blob:")
    ) {
      revokeBlobTextureUrl(currentMap.map);
      clearManagedTextureCache(currentMap.map);
    }
    resetMapState(mapKey);

    const resetProps = Object.fromEntries(
      properties.map((property) => [property, initialMapProperties[property]]),
    ) as Partial<MapProperties>;
    const nextProps = {
      ...mapProperties,
      ...resetProps,
    };
    setMapProperties(resetProps);

    if (!selectedMesh) {
      return;
    }

    applyMaterialProperties(selectedMesh, resetProps);
    await applyTextureSnapshot(mapKey, initialMap, nextProps);
  };

  const handleResetMaterial = async () => {
    mapSections.forEach((section) => {
      const mapInfo = maps[section.key];
      const initialMap = initialMaps[section.key];
      if (
        mapInfo.map &&
        mapInfo.map !== initialMap?.map &&
        mapInfo.map.startsWith("blob:")
      ) {
        revokeBlobTextureUrl(mapInfo.map);
        clearManagedTextureCache(mapInfo.map);
      }
    });
    resetMaterialState();
    await applyMaterialSnapshot(initialMaps, initialMapProperties);
  };

  if (!selectedObject) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Select a mesh to edit its material</p>
      </div>
    );
  }

  const localTransformProps = [
    "repeatX",
    "repeatY",
    "rotation",
    "wrapS",
    "wrapT",
  ] as const;

  const activeLocalTransformMaps = mapSections.filter(
    (section) => maps[section.key].use,
  );

  const renderPropertyRows = (
    properties: readonly (keyof MapProperties)[],
    onChange: (key: keyof MapProperties, value: MapProperties[keyof MapProperties]) => void,
  ) =>
    properties.map((propKey) => {
      const config = propertyConfig[propKey];
      if (!config) return null;

      return (
        <PropertyRow
          key={propKey}
          config={config}
          value={mapProperties[propKey]}
          onChange={(value) => onChange(propKey, value)}
        />
      );
    });

  return (
    <div className="space-y-2.5 px-2 overflow-y-auto flex-1 h-full min-h-0">
      <div className="flex items-center justify-between px-2 pb-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Material Controls
        </p>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => void handleResetMaterial()}
          disabled={!canEditMaterial}
        >
          <Icon icon={ArrowReloadHorizontalIcon} className="h-3.5 w-3.5" />
          Reset Material
        </Button>
      </div>
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={ColorPickerIcon} className="h-4 w-4" />
            <span className="font-medium text-sm">Surface</span>
          </div>
          <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-2 px-2">
            {renderPropertyRows(surfaceProperties, handlePropertyChange)}
            <p className="mt-2 border-t pt-2 px-1 text-[10px] italic text-muted-foreground">
              Core finish controls live here so you can shape the material
              before getting into texture-specific tuning.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={Image01Icon} className="h-4 w-4" />
            <span className="font-medium text-sm">Textures</span>
          </div>
          <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-2 px-2 pb-2">
            {mapSections.map((section) => {
              const mapInfo = maps[section.key];

              return (
                <Collapsible key={section.key}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent group">
                    <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted",
                          mapInfo.use && "border-chart-2 bg-chart-2/10",
                        )}
                      >
                        {mapInfo.thumbnail ? (
                          <img
                            src={mapInfo.thumbnail}
                            alt={`${section.label} texture preview`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Icon icon={Image01Icon} className="h-3 w-3 opacity-30" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span
                          className={cn(
                            "block truncate text-sm font-medium",
                            mapInfo.use && "font-semibold text-chart-2",
                          )}
                        >
                          {section.label}
                        </span>
                      </div>
                    </div>
                    <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 px-2 pb-2">
                      <div className="w-28">
                        <MapRow
                          mapKey={section.key}
                          label={section.label}
                          thumbnail={mapInfo.thumbnail}
                          map={mapInfo.map}
                          isActive={mapInfo.use}
                          canEdit={canEditMaterial}
                          hideLabel
                          onReset={() => void handleResetMap(section.key, section.properties)}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={GlobeIcon} className="h-4 w-4" />
            <span className="font-medium text-sm">Transforms</span>
          </div>
          <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-3 px-2 pb-2">
            <div className="space-y-2">
              <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Global
              </p>
              {renderPropertyRows(globalTransformProperties, handlePropertyChange)}
              <p className="border-t pt-2 px-1 text-[10px] italic text-muted-foreground">
                Global transforms do not affect the AO map.
              </p>
            </div>

            <div className="space-y-2.5 border-t border-border pt-3">
              <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Per-Map Overrides
              </p>
              {activeLocalTransformMaps.length > 0 ? (
                activeLocalTransformMaps.map((section) => {
                  const mapInfo = maps[section.key];
                  return (
                    <Collapsible key={`${section.key}-transforms`}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted",
                              mapInfo.use && "border-chart-2",
                            )}
                          >
                            {mapInfo.thumbnail ? (
                              <img
                                src={mapInfo.thumbnail}
                                alt={`${section.label} transform preview`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Icon icon={Image01Icon} className="h-3 w-3 opacity-30" />
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {section.label}
                          </span>
                        </div>
                        <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 space-y-2 px-2 pb-2">
                          {localTransformProps.map((propKey) => {
                            const config = propertyConfig[propKey];
                            if (!config) return null;

                            return (
                              <PropertyRow
                                key={`${section.key}-${propKey}`}
                                config={config}
                                value={mapInfo[propKey]}
                                onChange={(value) =>
                                  handleLocalPropertyChange(
                                    section.key,
                                    propKey,
                                    value,
                                  )
                                }
                              />
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })
              ) : (
                <p className="px-1 text-xs text-muted-foreground">
                  Load a texture map to fine-tune its local tiling and rotation.
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Icon icon={Settings02Icon} className="h-4 w-4" />
            <span className="font-medium text-sm">Advanced</span>
          </div>
          <Icon icon={ArrowDown01Icon} className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-3 px-2 pb-2">
            {advancedSections.map((section) => (
              <div
                key={section.label}
                className="space-y-2 border-b border-border/60 pb-2.5 last:border-b-0 last:pb-0"
              >
                <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {section.label}
                </p>
                {renderPropertyRows(section.properties, handlePropertyChange)}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Spacer for better scrolling */}
      <div className="h-10 shrink-0" />
    </div>
  );
};

// Map row component
const MapRow = React.memo(function MapRow({
  mapKey,
  label,
  thumbnail,
  map,
  isActive,
  canEdit,
  hideLabel,
  onReset,
}: {
  mapKey: keyof MaterialMaps;
  label: string;
  thumbnail: string;
  map: string;
  isActive: boolean;
  canEdit: boolean;
  hideLabel?: boolean;
  onReset: () => void;
}) {
  const [error, setError] = React.useState(false);
  const setMaps = useMaterialStore((state) => state.setMaps);
  const selectedMesh = useMaterialStore((state) => state.selectedMesh);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Only attempt to show images that look like valid sources (Data URL, Blob URL, or HTTP)
  const imageSrc =
    thumbnail?.startsWith("data:") ||
    thumbnail?.startsWith("blob:") ||
    thumbnail?.startsWith("http")
      ? thumbnail
      : map?.startsWith("data:") ||
          map?.startsWith("blob:") ||
          map?.startsWith("http")
        ? map
        : "";

  const hasImage = !!imageSrc && !error;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMesh) {
      return;
    }

    const url = createManagedTextureSource(file);
    const previousMap = map;

    void loadConfiguredTexture(
      url,
      {
        thumbnail: "",
        map: url,
        use: true,
        repeatX: mapKey === "aoMap" ? 1 : 8,
        repeatY: mapKey === "aoMap" ? 1 : 8,
        rotation: useMaterialStore.getState().mapProperties.rotation,
        wrapS: useMaterialStore.getState().mapProperties.wrapS,
        wrapT: useMaterialStore.getState().mapProperties.wrapT,
      },
      { flipY: useMaterialStore.getState().mapProperties.flipY },
      getWrapModeValue,
    )
      .then((texture) => {
        // Prevent race condition: only apply if the mesh is still selected
        if (useMaterialStore.getState().selectedMesh !== selectedMesh) {
          texture.dispose();
          revokeBlobTextureUrl(url);
          return;
        }

        // Apply existing properties to the new texture
        const props = useMaterialStore.getState().mapProperties;

        // Reset repeat to 8 as per user request whenever a new texture is applied
        const repeatVal = mapKey === "aoMap" ? 1 : 8;
        updateMeshTexture(selectedMesh, mapKey, texture);

        const dataUrl = textureToDataURL(texture);
        if (previousMap && previousMap !== url) {
          revokeBlobTextureUrl(previousMap);
          clearManagedTextureCache(previousMap);
        }
        setMaps({
          [mapKey]: {
            thumbnail: dataUrl,
            map: url,
            use: true,
            repeatX: repeatVal,
            repeatY: repeatVal,
            rotation: props.rotation,
            wrapS: props.wrapS,
            wrapT: props.wrapT,
          },
        });

        setError(false);
      })
      .catch(() => {
        revokeBlobTextureUrl(url);
      })
      .finally(() => {
        // Reset input value to allow selecting the same file again
        e.target.value = "";
      });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMesh) {
      revokeBlobTextureUrl(map);
      clearManagedTextureCache(map);
      updateMeshTexture(selectedMesh, mapKey, null);
      setMaps({
        [mapKey]: {
          thumbnail: "",
          map: "",
          use: false,
          repeatX: mapKey === "aoMap" ? 1 : 8,
          repeatY: mapKey === "aoMap" ? 1 : 8,
          rotation: 0,
          wrapS: "Repeat",
          wrapT: "Repeat",
        },
      });
      setError(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-md border p-1.5",
        isActive
          ? "border-chart-2/30 bg-chart-2/5"
          : "border-border bg-muted/30",
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.ktx2"
      />

      <div className="flex items-start gap-1.5">
        <div
          onClick={() => canEdit && fileInputRef.current?.click()}
          className={cn(
            "relative flex aspect-square flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-[6px] border shadow-sm",
            isActive
              ? "bg-chart-2/20 border-chart-2/50"
              : "bg-background border-border",
          )}
        >
          {hasImage ? (
            <img
              src={imageSrc}
              alt={label}
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
              onError={() => setError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Icon icon={Upload01Icon} className="h-4 w-4 text-muted-foreground/40" />
              <span className="text-[8px] text-muted-foreground/40 uppercase font-bold tracking-wider">
                Upload
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canEdit}
            className="absolute inset-0 flex items-center justify-center bg-black/28 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
            title={isActive ? `Replace ${label}` : `Upload ${label}`}
          >
            <div className="flex items-center gap-1 rounded border border-white/30 bg-black/50 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-white">
              <Icon icon={Upload01Icon} className="h-3.5 w-3.5" />
              {isActive ? "Replace" : "Upload"}
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="xs"
            onClick={onReset}
            disabled={!canEdit}
            title={`Reset ${label}`}
          >
            <Icon icon={ArrowReloadHorizontalIcon} className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={handleClear}
            disabled={!canEdit || !isActive}
            className="text-destructive hover:text-destructive"
            title={`Remove ${label}`}
          >
            <Icon icon={Cancel01Icon} className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {!hideLabel && (
        <span
          className={cn(
            "mt-1 block text-[10px] text-center leading-tight font-medium line-clamp-2",
            isActive ? "text-chart-2" : "text-muted-foreground",
          )}
        >
          {label.replace(" (Diffuse)", "")}
        </span>
      )}
    </div>
  );
});

// Property row component
const PropertyRow = React.memo(function PropertyRow({
  config,
  value,
  onChange,
}: {
  config: (typeof propertyConfig)[string];
  value: MapProperties[keyof MapProperties];
  onChange: (value: MapProperties[keyof MapProperties]) => void;
}) {
  const throttledChange = useRafThrottledCallback(onChange);

  if (config.type === "slider") {
    return (
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-muted-foreground">
            {config.label}
          </label>
          <input
            type="number"
            value={value as number}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(v);
            }}
            step={config.step}
            min={config.min}
            max={config.max}
            className="h-5 w-14 rounded bg-muted/50 px-1 text-right font-mono text-[10px] outline-none [appearance:textfield] focus:ring-1 focus:ring-chart-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value as number}
          onChange={(e) => throttledChange(parseFloat(e.target.value))}
          className="h-1.5 w-full appearance-none rounded-full bg-muted cursor-pointer [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-chart-2/80"
        />
      </div>
    );
  }

  if (config.type === "color") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-muted-foreground">{config.label}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 rounded border cursor-pointer"
          />
          <span className="text-[11px] font-mono uppercase">
            {(value as string).slice(1)}
          </span>
        </div>
      </div>
    );
  }

  if (config.type === "select") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-muted-foreground">{config.label}</label>
        <select
          value={value as string | number}
          onChange={(e) => {
            const v = e.target.value;
            // Handle numeric options
            onChange(isNaN(Number(v)) ? v : Number(v));
          }}
          className="cursor-pointer rounded border bg-muted px-2 py-1 text-[11px]"
        >
          {config.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (config.type === "toggle") {
    return (
      <div className="flex items-center justify-between py-1">
        <label className="text-[11px] text-muted-foreground">{config.label}</label>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }

  return null;
});
