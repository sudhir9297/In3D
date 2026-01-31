import { gsap } from "gsap";
import { Mesh, Object3D, Material, Color } from "three";

interface HighlightOptions {
  highlightColor?: { r: number; g: number; b: number } | string;
  duration?: number;
  delay?: number;
  ease?: string;
  onComplete?: () => void;
  onStart?: () => void;
  intensity?: number;
  pulseDuration?: number;
  pulseCount?: number;
}

interface MaterialWithColor extends Material {
  color: Color;
  emissive?: Color;
}

const isMaterialWithColor = (
  material: Material,
): material is MaterialWithColor => {
  return "color" in material && material.color instanceof Color;
};

const isMaterialWithEmissive = (
  material: Material,
): material is MaterialWithColor & { emissive: Color } => {
  return "emissive" in material && material.emissive instanceof Color;
};

export const highlightMesh = (
  mesh: Object3D,
  options: HighlightOptions = {},
): gsap.core.Timeline | null => {
  const {
    highlightColor = { r: 1.0, g: 0.2, b: 0.2 },
    duration = 0.4,
    delay = 0,
    ease = "power2.inOut",
    onComplete,
    onStart,
    intensity = 0.3,
    pulseDuration,
    pulseCount = 1,
  } = options;

  // Type guard to ensure we have a mesh
  if (!(mesh instanceof Mesh)) {
    console.warn("highlightMesh: Object is not a Mesh instance");
    return null;
  }

  // Handle array of materials
  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];

  // Filter materials that have color property
  const coloredMaterials = materials.filter(isMaterialWithColor);

  if (coloredMaterials.length === 0) {
    console.warn("highlightMesh: No materials with color property found");
    return null;
  }

  // Store original colors for restoration
  const originalColors = coloredMaterials.map((material) => ({
    material,
    originalColor: {
      r: material.color.r,
      g: material.color.g,
      b: material.color.b,
    },
    originalEmissive: isMaterialWithEmissive(material)
      ? {
          r: material.emissive.r,
          g: material.emissive.g,
          b: material.emissive.b,
        }
      : null,
  }));

  // Parse highlight color
  const targetColor =
    typeof highlightColor === "string"
      ? new Color(highlightColor)
      : new Color(highlightColor.r, highlightColor.g, highlightColor.b);

  // Create timeline
  const timeline = gsap.timeline({
    delay,
    onStart,
    onComplete: () => {
      // Ensure colors are restored to exact original values
      originalColors.forEach(
        ({ material, originalColor, originalEmissive }) => {
          material.color.setRGB(
            originalColor.r,
            originalColor.g,
            originalColor.b,
          );
          if (originalEmissive && isMaterialWithEmissive(material)) {
            material.emissive.setRGB(
              originalEmissive.r,
              originalEmissive.g,
              originalEmissive.b,
            );
          }
        },
      );
      onComplete?.();
    },
  });

  // Create highlight animation for each material
  coloredMaterials.forEach((material) => {
    const colorAnimation = {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration,
      ease,
    };

    if (pulseDuration) {
      // Pulsing animation
      for (let i = 0; i < pulseCount; i++) {
        timeline.to(material.color, colorAnimation, i * pulseDuration * 2).to(
          material.color,
          {
            r: originalColors.find((oc) => oc.material === material)!
              .originalColor.r,
            g: originalColors.find((oc) => oc.material === material)!
              .originalColor.g,
            b: originalColors.find((oc) => oc.material === material)!
              .originalColor.b,
            duration,
            ease,
          },
          i * pulseDuration * 2 + pulseDuration,
        );
      }
    } else {
      // Single highlight and return
      timeline.to(material.color, colorAnimation).to(material.color, {
        r: originalColors.find((oc) => oc.material === material)!.originalColor
          .r,
        g: originalColors.find((oc) => oc.material === material)!.originalColor
          .g,
        b: originalColors.find((oc) => oc.material === material)!.originalColor
          .b,
        duration,
        ease,
      });
    }

    // Add emissive glow if material supports it
    if (isMaterialWithEmissive(material)) {
      const emissiveAnimation = {
        r: targetColor.r * intensity,
        g: targetColor.g * intensity,
        b: targetColor.b * intensity,
        duration,
        ease,
      };

      if (pulseDuration) {
        for (let i = 0; i < pulseCount; i++) {
          timeline
            .to(material.emissive, emissiveAnimation, i * pulseDuration * 2)
            .to(
              material.emissive,
              {
                r: originalColors.find((oc) => oc.material === material)!
                  .originalEmissive!.r,
                g: originalColors.find((oc) => oc.material === material)!
                  .originalEmissive!.g,
                b: originalColors.find((oc) => oc.material === material)!
                  .originalEmissive!.b,
                duration,
                ease,
              },
              i * pulseDuration * 2 + pulseDuration,
            );
        }
      } else {
        timeline
          .to(material.emissive, emissiveAnimation, 0)
          .to(material.emissive, {
            r: originalColors.find((oc) => oc.material === material)!
              .originalEmissive!.r,
            g: originalColors.find((oc) => oc.material === material)!
              .originalEmissive!.g,
            b: originalColors.find((oc) => oc.material === material)!
              .originalEmissive!.b,
            duration,
            ease,
          });
      }
    }
  });

  return timeline;
};

// ====================
// Material Extraction & Application
// ====================

import {
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  Texture,
  RepeatWrapping,
  ClampToEdgeWrapping,
  MirroredRepeatWrapping,
  FrontSide,
  BackSide,
  DoubleSide,
  Wrapping,
} from "three";
import {
  MaterialMaps,
  MapProperties,
  defaultMaps,
  defaultMapProperties,
  TextureMapInfo,
} from "../store/materialStore";

type StandardMaterial = MeshStandardMaterial | MeshPhysicalMaterial;

const isStandardMaterial = (
  material: Material,
): material is StandardMaterial => {
  return (
    material instanceof MeshStandardMaterial ||
    material instanceof MeshPhysicalMaterial
  );
};

// Helper to convert Color to hex string
const colorToHex = (color: Color): string => {
  return `#${color.getHexString().toUpperCase()}`;
};

// Helper to get wrap mode string
const getWrapModeString = (wrap: number): string => {
  switch (wrap) {
    case RepeatWrapping:
      return "Repeat";
    case ClampToEdgeWrapping:
      return "ClampToEdge";
    case MirroredRepeatWrapping:
      return "MirroredRepeat";
    default:
      return "Repeat";
  }
};

// Helper to map store map keys to Three.js material property names
const getMaterialMapKey = (mapKey: keyof MaterialMaps): string => {
  if (mapKey === "albedoMap") return "map";
  return mapKey;
};

/**
 * Update or clear a texture map on a mesh
 */
export const updateMeshTexture = (
  object: Object3D,
  mapKey: keyof MaterialMaps,
  texture: Texture | null,
): void => {
  if (!(object instanceof Mesh)) return;

  const materials = Array.isArray(object.material)
    ? object.material
    : [object.material];

  const propName = getMaterialMapKey(mapKey);

  materials.forEach((material) => {
    if (!isStandardMaterial(material)) return;

    (material as any)[propName] = texture;
    material.needsUpdate = true;
  });
};

// Helper to get wrap mode number
const getWrapModeNumber = (wrap: string): Wrapping => {
  switch (wrap) {
    case "Repeat":
      return RepeatWrapping;
    case "ClampToEdge":
      return ClampToEdgeWrapping;
    case "MirroredRepeat":
      return MirroredRepeatWrapping;
    default:
      return RepeatWrapping;
  }
};

/**
 * Converts a Three.js texture to a data URL for thumbnails
 */
export const textureToDataURL = (
  texture: Texture,
  size: number = 64,
): string => {
  const image = texture.image || (texture as any).source?.data;
  if (!image) return "";

  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Handle different image types
    if (
      image instanceof HTMLImageElement ||
      image instanceof HTMLCanvasElement ||
      image instanceof ImageBitmap
    ) {
      ctx.drawImage(image, 0, 0, size, size);
    } else if (image.data && image.width && image.height) {
      // Handle ImageData like structures (DataTexture)
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        const imageData = new ImageData(
          new Uint8ClampedArray(image.data.buffer || image.data),
          image.width,
          image.height,
        );
        tempCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0, size, size);
      }
    }

    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("Failed to generate texture thumbnail:", e);
    return "";
  }
};

// Helper to create texture map info
const getTextureMapInfo = (texture: Texture | null): TextureMapInfo => {
  const defaults = {
    repeatX: 8,
    repeatY: 8,
    rotation: 0,
    wrapS: "Repeat",
    wrapT: "Repeat",
  };

  if (!texture) {
    return { thumbnail: "", map: "", use: false, ...defaults };
  }

  const image = texture.image || (texture as any).source?.data;

  // If it's a direct HTMLImageElement with a src, use it directly (more efficient)
  if (
    image instanceof HTMLImageElement &&
    image.src &&
    image.src.startsWith("http")
  ) {
    return {
      thumbnail: image.src,
      map: image.src,
      use: true,
      ...defaults,
    };
  }

  // Otherwise generate a small thumbnail data URL
  const thumbnail = textureToDataURL(texture);
  const source =
    texture.name || (image instanceof HTMLImageElement ? image.src : "texture");

  return {
    thumbnail:
      thumbnail || (image instanceof HTMLImageElement ? image.src : ""),
    map: source,
    use: true,
    ...defaults,
  };
};

/**
 * Extract material properties from a mesh's material
 */
export const extractMaterialProperties = (
  object: Object3D,
): { maps: MaterialMaps; mapProperties: MapProperties } | null => {
  if (!(object instanceof Mesh)) {
    console.warn("extractMaterialProperties: Object is not a Mesh instance");
    return null;
  }

  // Get the first material if it's an array
  const material = Array.isArray(object.material)
    ? object.material[0]
    : object.material;

  if (!material) {
    console.warn("extractMaterialProperties: No material found");
    return null;
  }

  // For non-standard materials, return defaults
  if (!isStandardMaterial(material)) {
    console.warn(
      "extractMaterialProperties: Material is not a StandardMaterial, using defaults",
    );
    return {
      maps: { ...defaultMaps },
      mapProperties: { ...defaultMapProperties },
    };
  }

  // Extract texture maps
  const getMapInfoWithTransforms = (
    texture: Texture | null,
    isAO: boolean,
  ): TextureMapInfo => {
    const info = getTextureMapInfo(texture);
    return {
      ...info,
      repeatX: texture?.repeat?.x ?? (isAO ? 1 : 8),
      repeatY: texture?.repeat?.y ?? (isAO ? 1 : 8),
      rotation: texture?.rotation ?? 0,
      wrapS: texture ? getWrapModeString(texture.wrapS) : "Repeat",
      wrapT: texture ? getWrapModeString(texture.wrapT) : "Repeat",
    };
  };

  const maps: MaterialMaps = {
    albedoMap: getMapInfoWithTransforms(material.map, false),
    metalnessMap: getMapInfoWithTransforms(material.metalnessMap, false),
    roughnessMap: getMapInfoWithTransforms(material.roughnessMap, false),
    normalMap: getMapInfoWithTransforms(material.normalMap, false),
    displacementMap: getMapInfoWithTransforms(material.displacementMap, false),
    aoMap: getMapInfoWithTransforms(material.aoMap, true),
    emissiveMap: getMapInfoWithTransforms(material.emissiveMap, false),
    bumpMap: getMapInfoWithTransforms(material.bumpMap, false),
    alphaMap: getMapInfoWithTransforms(material.alphaMap, false),
    lightMap: getMapInfoWithTransforms(material.lightMap, false),
  };

  // Get repeat values from first available texture
  const firstTexture =
    material.map ||
    material.normalMap ||
    material.roughnessMap ||
    material.metalnessMap;
  const repeatX = firstTexture?.repeat?.x ?? 1;
  const repeatY = firstTexture?.repeat?.y ?? 1;
  const rotation = firstTexture?.rotation ?? 0;
  const wrapS = firstTexture ? getWrapModeString(firstTexture.wrapS) : "Repeat";
  const wrapT = firstTexture ? getWrapModeString(firstTexture.wrapT) : "Repeat";
  const flipY = firstTexture?.flipY ?? true;

  // Extract scalar properties
  const mapProperties: MapProperties = {
    color: colorToHex(material.color),
    roughness: material.roughness,
    metalness: material.metalness,
    repeatX,
    repeatY,
    normalScaleX: material.normalScale?.x ?? 1,
    normalScaleY: material.normalScale?.y ?? 1,
    wrapS,
    wrapT,
    emissiveIntensity: material.emissiveIntensity,
    displacementScale: material.displacementScale,
    transparent: material.transparent,
    flipY,
    bumpScale: material.bumpScale,
    emissiveColor: colorToHex(material.emissive),
    aoMapIntensity: material.aoMapIntensity,
    side: material.side === FrontSide ? 0 : material.side === BackSide ? 1 : 2,
    rotation,
    opacity: material.opacity,
    lightMapIntensity: material.lightMapIntensity,
  };

  return { maps, mapProperties };
};

/**
 * Helper to apply transformations to a specific texture
 */
const applyTextureTransformations = (
  texture: Texture,
  props: Partial<TextureMapInfo>,
) => {
  if (props.repeatX !== undefined || props.repeatY !== undefined) {
    texture.repeat.set(
      props.repeatX ?? texture.repeat.x,
      props.repeatY ?? texture.repeat.y,
    );
  }
  if (props.wrapS !== undefined) {
    texture.wrapS = getWrapModeNumber(props.wrapS);
  }
  if (props.wrapT !== undefined) {
    texture.wrapT = getWrapModeNumber(props.wrapT);
  }
  if (props.rotation !== undefined) {
    texture.rotation = props.rotation;
  }
  texture.needsUpdate = true;
};

/**
 * Apply material properties to a mesh's material
 */
export const applyMaterialProperties = (
  object: Object3D,
  props: Partial<MapProperties>,
  targetMapKey?: keyof MaterialMaps,
): void => {
  if (!(object instanceof Mesh)) {
    console.warn("applyMaterialProperties: Object is not a Mesh instance");
    return;
  }

  const materials = Array.isArray(object.material)
    ? object.material
    : [object.material];

  materials.forEach((material) => {
    if (!isStandardMaterial(material)) return;

    // 1. Apply map-specific transformation if targeted
    if (targetMapKey) {
      const propName = getMaterialMapKey(targetMapKey);
      const texture = (material as any)[propName] as Texture | null;
      if (texture) {
        applyTextureTransformations(texture, props as any);
      }
      // If we are only updating a specific map's transforms, we can stop here
      // unless scalar properties are also passed (unlikely in this UI flow)
      if (
        Object.keys(props).every((k) =>
          ["repeatX", "repeatY", "rotation", "wrapS", "wrapT"].includes(k),
        )
      ) {
        return;
      }
    }

    // 2. Apply scalar properties
    if (props.color !== undefined) {
      material.color.set(props.color);
    }
    if (props.roughness !== undefined) {
      material.roughness = props.roughness;
    }
    if (props.metalness !== undefined) {
      material.metalness = props.metalness;
    }
    if (props.emissiveIntensity !== undefined) {
      material.emissiveIntensity = props.emissiveIntensity;
    }
    if (props.emissiveColor !== undefined) {
      material.emissive.set(props.emissiveColor);
    }
    if (props.displacementScale !== undefined) {
      material.displacementScale = props.displacementScale;
    }
    if (props.bumpScale !== undefined) {
      material.bumpScale = props.bumpScale;
    }
    if (props.aoMapIntensity !== undefined) {
      material.aoMapIntensity = props.aoMapIntensity;
    }
    if (props.lightMapIntensity !== undefined) {
      material.lightMapIntensity = props.lightMapIntensity;
    }
    if (props.transparent !== undefined) {
      material.transparent = props.transparent;
    }
    if (props.opacity !== undefined) {
      material.opacity = props.opacity;
    }
    if (props.side !== undefined) {
      material.side =
        props.side === 0 ? FrontSide : props.side === 1 ? BackSide : DoubleSide;
    }
    if (props.normalScaleX !== undefined || props.normalScaleY !== undefined) {
      material.normalScale.set(
        props.normalScaleX ?? material.normalScale.x,
        props.normalScaleY ?? material.normalScale.y,
      );
    }

    // 3. Apply texture properties globally if NO targetMapKey is provided
    if (!targetMapKey) {
      const textures = [
        material.map,
        material.normalMap,
        material.roughnessMap,
        material.metalnessMap,
        material.displacementMap,
        material.aoMap,
        material.emissiveMap,
        material.bumpMap,
        material.alphaMap,
        material.lightMap,
      ].filter((t): t is Texture => t !== null);

      textures.forEach((texture) => {
        // Skip global transformations for AO maps unless explicitly targeted (which shouldn't happen here)
        const isAO = texture === material.aoMap;
        if (!isAO) {
          applyTextureTransformations(texture, props as any);
          if (props.flipY !== undefined) {
            texture.flipY = props.flipY;
          }
        } else if (props.flipY !== undefined) {
          // FlipY still applies to AO
          texture.flipY = props.flipY;
          texture.needsUpdate = true;
        }
      });
    }

    material.needsUpdate = true;
  });
};
