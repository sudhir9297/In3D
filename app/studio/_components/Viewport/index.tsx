"use client";
import * as THREE from "three";
import { WebGLRenderer } from "three";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Center,
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from "@react-three/drei";
import { cn } from "@/lib/utils";
import Scene from "./scene";
import { loadModelFiles } from "../../utils/modelLoaders";
import { useModelStore } from "../../store/modelStore";
import { useViewportStore } from "../../store/viewportStore";
import { useViewportRenderInvalidation } from "../../hooks/useViewportRenderInvalidation";

import Dropzone from "./dropzone";
import SceneGrid from "./scene-grid";
// import Postprocessing from "./postprocessing";
import Postprocessing3 from "./postprocessing3";
import { SunLightRig } from "./sun-light-rig";
import {
  useEnvironmentStore,
  ToneMappingMode,
} from "../../store/environmentStore";
import { useLightingStore } from "../../store/lightingStore";
import {
  loadStudioTexture,
  setTextureLoaderRenderer,
} from "../../utils/textureLoaders";

const TONE_MAPPING_MAP: Record<ToneMappingMode, number> = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
  AgX: (THREE as any).AgXToneMapping || THREE.ACESFilmicToneMapping,
  Neutral: (THREE as any).NeutralToneMapping || THREE.ACESFilmicToneMapping,
};

const GlUpdater = ({
  toneMapping,
  exposure,
  rotation,
}: {
  toneMapping: number;
  exposure: number;
  rotation: number;
}) => {
  const { gl, scene } = useThree();

  useEffect(() => {
    gl.toneMapping = toneMapping as any;
    gl.toneMappingExposure = exposure;
  }, [gl, toneMapping, exposure]);

  useEffect(() => {
    const rad = THREE.MathUtils.degToRad(rotation);
    if (scene.backgroundRotation) {
      scene.backgroundRotation.set(0, rad, 0);
    }
    if (scene.environmentRotation) {
      scene.environmentRotation.set(0, rad, 0);
    }
  }, [scene, rotation]);

  return null;
};

const ViewportGizmo = () => {
  const { gl } = useThree();
  const canUseDreiGizmo = Boolean(
    (gl as { isWebGLRenderer?: boolean }).isWebGLRenderer,
  );

  if (!canUseDreiGizmo) {
    return null;
  }

  return (
    <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
      <GizmoViewport
        axisColors={["#ff3653", "#0adb50", "#2c8fdf"]}
        labelColor="white"
      />
    </GizmoHelper>
  );
};

const downloadCanvasScreenshot = (canvas: HTMLCanvasElement) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `in3d-screenshot-${timestamp}.png`;
  const link = document.createElement("a");

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (typeof canvas.toBlob === "function") {
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob);
      }
    }, "image/png");
    return;
  }

  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
};

const ScreenshotController = () => {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const screenshotRequestId = useViewportStore(
    (state) => state.screenshotRequestId,
  );

  useEffect(() => {
    if (!screenshotRequestId) {
      return;
    }

    let cancelled = false;

    invalidate();

    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }

        const canvas = gl.domElement as HTMLCanvasElement | undefined;
        if (!canvas) {
          return;
        }

        downloadCanvasScreenshot(canvas);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [gl, invalidate, screenshotRequestId]);

  return null;
};

const SolidBackground = ({
  color,
  active,
}: {
  color: string;
  active: boolean;
}) => {
  const { scene } = useThree();
  const managedColorRef = useRef(new THREE.Color(color));

  useEffect(() => {
    if (!active) {
      return;
    }

    managedColorRef.current.set(color);
    scene.background = managedColorRef.current;
  }, [active, color, scene]);

  return null;
};

const CanvasInvalidator = () => {
  useViewportRenderInvalidation();
  return null;
};

export const ViewerWrapper = () => {
  const [isDragging, setIsDragging] = useState(false);
  const rendererRef = useRef<unknown>(null);
  const addObject = useModelStore((state) => state.addObject);
  const objects = useModelStore((state) => state.objects);
  const showGrid = useViewportStore((state) => state.showGrid);
  const daylightEnabled = useLightingStore((state) => state.enabled);
  const beginInteraction = useViewportStore((state) => state.beginInteraction);
  const endInteraction = useViewportStore((state) => state.endInteraction);

  const {
    backgroundColor,
    hdrEnabled,
    showHDR,
    hdrPath,
    hdrBlur,
    hdrRotation,
    hdrIntensity,
    backgroundImage,
    exposure,
    toneMapping,
  } = useEnvironmentStore();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      void loadModelFiles(Array.from(e.dataTransfer.files), rendererRef.current)
        .then((objects) => {
          objects.forEach(addObject);
        });
    },
    [addObject],
  );

  return (
    <div
      className={cn(
        "w-full h-full relative",
        isDragging ? "bg-accent" : "bg-background",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {objects.length === 0 && (
        <Dropzone isDragging={isDragging} renderer={rendererRef.current} />
      )}

      <Canvas
        id="studio-3d-canvas"
        frameloop="demand"
        dpr={[1, 1.25]}
        className="absolute top-0 left-0 w-full h-full"
        onCreated={({ gl }) => {
          rendererRef.current = gl;
          setTextureLoaderRenderer(gl);
        }}
        shadows={{
          type: THREE.PCFSoftShadowMap,
          enabled: true,
        }}
        gl={
          (async (props: HTMLCanvasElement) => {
            const createWebGLRenderer = () => {
              const renderer = new WebGLRenderer({
                ...(props as any),
                antialias: true,
                preserveDrawingBuffer: true,
                powerPreference: "high-performance",
              });
              renderer.toneMapping = THREE.ACESFilmicToneMapping;
              renderer.toneMappingExposure = 0.9;
              return renderer as any;
            };

            try {
              const { WebGPURenderer } = await import("three/webgpu");
              const renderer = new WebGPURenderer(props as any);
              renderer.toneMapping = THREE.ACESFilmicToneMapping;
              renderer.toneMappingExposure = 0.9;
              await renderer.init();
              return renderer as any;
            } catch {
              console.warn(
                "[Viewer] WebGPU init failed, falling back to WebGLRenderer.",
              );
              return createWebGLRenderer();
            }
          }) as any
        }
        camera={{ fov: 50, near: 0.1, far: 1000 }}
      >
        <CanvasInvalidator />
        <ScreenshotController />
        <GlUpdater
          toneMapping={TONE_MAPPING_MAP[toneMapping]}
          exposure={exposure}
          rotation={hdrRotation}
        />
        <Center>
          <Scene />
        </Center>

        <OrbitControls
          makeDefault
          enablePan={true}
          keyPanSpeed={10}
          panSpeed={1.5}
          enableDamping={true}
          dampingFactor={0.05}
          onStart={beginInteraction}
          onEnd={endInteraction}
        />

        {daylightEnabled ? <SunLightRig /> : null}

        {backgroundImage ? (
          <BackgroundImageLoader url={backgroundImage} />
        ) : (
          <SolidBackground
            color={backgroundColor}
            active={!daylightEnabled && !(hdrEnabled && showHDR && Boolean(hdrPath))}
          />
        )}

        {hdrEnabled && hdrPath && (
          <Environment
            {...({
              preset: hdrPath as any,
              background: showHDR && !backgroundImage,
              blur: hdrBlur,
              environmentIntensity: hdrIntensity,
            } as any)}
          />
        )}
        {showGrid && <SceneGrid />}

        <ViewportGizmo />

        {/* <Postprocessing /> */}
        <Postprocessing3 />
      </Canvas>
    </div>
  );
};

const BackgroundImageLoader = ({ url }: { url: string }) => {
  const { gl, scene } = useThree();

  useEffect(() => {
    let isActive = true;
    let currentTexture: THREE.Texture | null = null;

    void loadStudioTexture(url, gl)
      .then((texture) => {
        if (!isActive) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        currentTexture = texture;
        scene.background = texture as any;
      })
      .catch((error) => {
        console.warn("Failed to load background texture", error);
      });

    return () => {
      isActive = false;
      scene.background = null;
      currentTexture?.dispose();
    };
  }, [gl, url, scene]);

  return null;
};
