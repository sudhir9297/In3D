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
  material: Material
): material is MaterialWithColor => {
  return "color" in material && material.color instanceof Color;
};

const isMaterialWithEmissive = (
  material: Material
): material is MaterialWithColor & { emissive: Color } => {
  return "emissive" in material && material.emissive instanceof Color;
};

export const highlightMesh = (
  mesh: Object3D,
  options: HighlightOptions = {}
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
            originalColor.b
          );
          if (originalEmissive && isMaterialWithEmissive(material)) {
            material.emissive.setRGB(
              originalEmissive.r,
              originalEmissive.g,
              originalEmissive.b
            );
          }
        }
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
          i * pulseDuration * 2 + pulseDuration
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
              i * pulseDuration * 2 + pulseDuration
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
