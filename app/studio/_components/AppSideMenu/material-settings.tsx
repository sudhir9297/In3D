"use client";

import React from "react";
import {
  useMaterialStore,
  MapProperties,
  MaterialMaps,
} from "../../store/materialStore";
import { useModelStore } from "../../store/modelStore";
import {
  applyMaterialProperties,
  updateMeshTexture,
  textureToDataURL,
} from "../../utils/common";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Image,
  Palette,
  Settings2,
  X,
  Upload,
  Globe,
} from "lucide-react";
import { TextureLoader } from "three";

// Map display names
const mapDisplayNames: Record<keyof MaterialMaps, string> = {
  albedoMap: "Albedo (Diffuse)",
  metalnessMap: "Metalness",
  roughnessMap: "Roughness",
  normalMap: "Normal",
  displacementMap: "Displacement",
  aoMap: "Ambient Occlusion",
  emissiveMap: "Emissive",
  bumpMap: "Bump",
  alphaMap: "Alpha",
  lightMap: "Light Map",
};

// Property categories for organization
const propertyCategories = {
  other: {
    label: "Other",
    properties: ["side"],
  },
  globalProperties: {
    label: "Global Properties",
    properties: ["repeatX", "repeatY", "rotation", "wrapS", "wrapT", "flipY"],
  },
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
  const {
    maps,
    mapProperties,
    selectedMesh,
    setMapProperties,
    setLocalMapProperties,
  } = useMaterialStore();
  const selectedObject = useModelStore((state) => state.selectedObject);

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
  ];

  return (
    <div className="space-y-3 p-2 overflow-y-auto flex-1 h-full min-h-0">
      {/* Global Properties Section (Top) */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="font-medium text-sm">
              {propertyCategories.globalProperties.label}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 mt-2 px-2">
            {propertyCategories.globalProperties.properties.map((propKey) => {
              const config = propertyConfig[propKey];
              if (!config) return null;
              const value = mapProperties[propKey as keyof MapProperties];
              return (
                <PropertyRow
                  key={propKey}
                  propKey={propKey}
                  config={config}
                  value={value}
                  onChange={(v) =>
                    handlePropertyChange(propKey as keyof MapProperties, v)
                  }
                />
              );
            })}
            <p className="text-[10px] text-muted-foreground italic mt-2 px-1 border-t pt-2">
              Note: Global transforms do not affect the AO map.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Map Sections */}
      {mapSections.map((section) => {
        const mapInfo = maps[section.key];
        return (
          <Collapsible key={section.key}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md group">
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className={cn(
                    "w-5 h-5 rounded border bg-muted shrink-0 flex items-center justify-center overflow-hidden",
                    mapInfo.use && "border-chart-2",
                  )}
                >
                  {mapInfo.thumbnail ? (
                    <img
                      src={mapInfo.thumbnail}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-3 h-3 opacity-30" />
                  )}
                </div>
                <span
                  className={cn(
                    "font-medium text-sm truncate",
                    mapInfo.use && "text-chart-2 font-semibold",
                  )}
                >
                  {section.label}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 mt-2 px-2 pb-2">
                <div className="w-32 aspect-square">
                  <MapRow
                    mapKey={section.key}
                    label={""} // Label is now in collapse header
                    thumbnail={mapInfo.thumbnail}
                    map={mapInfo.map}
                    isActive={mapInfo.use}
                    hideLabel
                  />
                </div>

                {/* Main section properties (Color, Roughness, etc) */}
                {section.properties.length > 0 && (
                  <div className="space-y-3 mt-1 pl-1">
                    {section.properties.map((propKey) => {
                      const config = propertyConfig[propKey];
                      if (!config) return null;
                      const value =
                        mapProperties[propKey as keyof MapProperties];
                      return (
                        <PropertyRow
                          key={propKey as string}
                          propKey={propKey as string}
                          config={config}
                          value={value}
                          onChange={(v) =>
                            handlePropertyChange(
                              propKey as keyof MapProperties,
                              v,
                            )
                          }
                        />
                      );
                    })}
                  </div>
                )}

                {/* Local Transformation Properties (Repeat, Rotation, Wrap) */}
                {mapInfo.use && (
                  <div className="pt-3 border-t border-muted/50 mt-2 space-y-3 pl-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                      Local Transforms
                    </p>
                    {localTransformProps.map((propKey) => {
                      const config = propertyConfig[propKey];
                      if (!config) return null;
                      // Get from local map data
                      const value = (mapInfo as any)[propKey];
                      return (
                        <PropertyRow
                          key={`${section.key}-${propKey}`}
                          propKey={propKey}
                          config={config}
                          value={value}
                          onChange={(v) =>
                            handleLocalPropertyChange(section.key, propKey, v)
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {/* Other Section (Bottom) */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="font-medium text-sm">
              {propertyCategories.other.label}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 mt-2 px-2">
            {propertyCategories.other.properties.map((propKey) => {
              const config = propertyConfig[propKey];
              if (!config) return null;
              const value = mapProperties[propKey as keyof MapProperties];
              return (
                <PropertyRow
                  key={propKey}
                  propKey={propKey}
                  config={config}
                  value={value}
                  onChange={(v) =>
                    handlePropertyChange(propKey as keyof MapProperties, v)
                  }
                />
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Spacer for better scrolling */}
      <div className="h-10 shrink-0" />
    </div>
  );
};

// Map row component
function MapRow({
  mapKey,
  label,
  thumbnail,
  map,
  isActive,
  hideLabel,
}: {
  mapKey: keyof MaterialMaps;
  label: string;
  thumbnail: string;
  map: string;
  isActive: boolean;
  hideLabel?: boolean;
}) {
  const [error, setError] = React.useState(false);
  const { setMaps, setMapProperties, selectedMesh } = useMaterialStore();
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
    if (file && selectedMesh) {
      const url = URL.createObjectURL(file);
      new TextureLoader().load(url, (texture) => {
        // Apply existing properties to the new texture
        const props = useMaterialStore.getState().mapProperties;

        // Reset repeat to 8 as per user request whenever a new texture is applied
        const repeatVal = mapKey === "aoMap" ? 1 : 8;
        texture.repeat.set(repeatVal, repeatVal);
        texture.flipY = props.flipY;
        texture.rotation = props.rotation;
        // Map wrap modes
        const wrapS =
          props.wrapS === "Repeat"
            ? 1000
            : props.wrapS === "ClampToEdge"
              ? 1001
              : 1002;
        const wrapT =
          props.wrapT === "Repeat"
            ? 1000
            : props.wrapT === "ClampToEdge"
              ? 1001
              : 1002;
        texture.wrapS = wrapS;
        texture.wrapT = wrapT;

        updateMeshTexture(selectedMesh, mapKey, texture);

        const dataUrl = textureToDataURL(texture);
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
      });
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMesh) {
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
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all hover:bg-accent/50 group cursor-pointer relative",
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
        accept="image/*"
      />

      <div
        className={cn(
          "w-full aspect-square rounded-md border flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative",
          isActive
            ? "bg-chart-2/20 border-chart-2/50"
            : "bg-background border-border",
        )}
      >
        {hasImage ? (
          <img
            src={imageSrc}
            alt={label}
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload className="w-4 h-4 text-muted-foreground/40" />
            <span className="text-[8px] text-muted-foreground/40 uppercase font-bold tracking-wider">
              Upload
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </div>
      </div>

      {isActive && (
        <button
          onClick={handleClear}
          className="absolute top-1 right-1 p-1 bg-background/80 hover:bg-destructive hover:text-white rounded-full shadow-sm border border-border opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Clear texture"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {!hideLabel && (
        <span
          className={cn(
            "text-[10px] text-center leading-tight font-medium line-clamp-2",
            isActive ? "text-chart-2" : "text-muted-foreground",
          )}
        >
          {label.replace(" (Diffuse)", "")}
        </span>
      )}
    </div>
  );
}

// Property row component
function PropertyRow({
  propKey,
  config,
  value,
  onChange,
}: {
  propKey: string;
  config: (typeof propertyConfig)[string];
  value: MapProperties[keyof MapProperties];
  onChange: (value: MapProperties[keyof MapProperties]) => void;
}) {
  if (config.type === "slider") {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">
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
            className="w-16 h-5 text-[10px] text-right bg-muted/50 border-none outline-none focus:ring-1 focus:ring-chart-2 rounded px-1 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value as number}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chart-2 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-chart-2/80"
        />
      </div>
    );
  }

  if (config.type === "color") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{config.label}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 rounded border cursor-pointer"
          />
          <span className="text-xs font-mono uppercase">
            {(value as string).slice(1)}
          </span>
        </div>
      </div>
    );
  }

  if (config.type === "select") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{config.label}</label>
        <select
          value={value as string | number}
          onChange={(e) => {
            const v = e.target.value;
            // Handle numeric options
            onChange(isNaN(Number(v)) ? v : Number(v));
          }}
          className="text-xs bg-muted border rounded px-2 py-1 cursor-pointer"
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
        <label className="text-xs text-muted-foreground">{config.label}</label>
        <button
          onClick={() => onChange(!value)}
          className={cn(
            "group relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-chart-2 focus:ring-offset-2",
            value ? "bg-chart-2" : "bg-muted-foreground/30",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out",
              value ? "translate-x-4" : "translate-x-0",
            )}
          />
        </button>
      </div>
    );
  }

  return null;
}

export default MaterialSettings;
