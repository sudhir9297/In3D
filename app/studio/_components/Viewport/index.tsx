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
import { loadGlbModel } from "../../utils/modelLoaders";
import { useModelStore } from "../../store/modelStore";
import { useViewportStore } from "../../store/viewportStore";

import Dropzone from "./dropzone";
import SceneGrid from "./scene-grid";
import Postprocessing from "./postprocessing";
import {
  useEnvironmentStore,
  ToneMappingMode,
} from "../../store/environmentStore";

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

export const ViewerWrapper = () => {
  const [isDragging, setIsDragging] = useState(false);
  const rendererRef = useRef<unknown>(null);
  const addObject = useModelStore((state) => state.addObject);
  const objects = useModelStore((state) => state.objects);
  const showGrid = useViewportStore((state) => state.showGrid);

  const {
    backgroundColor,
    showHDR,
    hdrPath,
    hdrBlur,
    hdrRotation,
    hdrIntensity,
    fogEnabled,
    fogColor,
    fogDensity,
    ambientIntensity,
    ambientColor,
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

      Array.from(e.dataTransfer.files).forEach(async (file) => {
        const object = await loadGlbModel(file, rendererRef.current);
        if (object) addObject(object);
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
        frameloop="always"
        dpr={[1, 1.25]}
        className="absolute top-0 left-0 w-full h-full"
        onCreated={({ gl }) => {
          rendererRef.current = gl;
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
        />

        <ambientLight intensity={ambientIntensity} color={ambientColor} />

        {fogEnabled && <fogExp2 attach="fog" args={[fogColor, fogDensity]} />}

        {backgroundImage ? (
          <BackgroundImageLoader url={backgroundImage} />
        ) : (
          <color attach="background" args={[backgroundColor]} />
        )}

        {hdrPath && (
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

        <Postprocessing />
      </Canvas>
    </div>
  );
};

const BackgroundImageLoader = ({ url }: { url: string }) => {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture as any;
    });

    return () => {
      scene.background = null;
    };
  }, [url, scene]);

  return null;
};
