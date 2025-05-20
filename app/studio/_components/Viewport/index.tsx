"use client";
import React, { useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Center,
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from "@react-three/drei";
import { useResponsiveCanvas } from "../../hooks/useResponsiveCanvas";
import * as THREE from "three";
import Scene from "./scene";
import { loadGlbModel } from "../../utils/modelLoaders";
import { useModelStore } from "../../store/modelStore";
import SceneGrid from "./scene-grid";
import { cn } from "@/lib/utils";

export const ViewerWrapper = ({
  sidebarIsOpen,
}: {
  sidebarIsOpen: boolean;
}) => {
  const SIDEBAR_WIDTH = 400;
  const [isDragging, setIsDragging] = useState(false);
  const addObject = useModelStore((state) => state.addObject);

  const { containerRef, canvasRef } = useResponsiveCanvas(
    sidebarIsOpen,
    SIDEBAR_WIDTH
  );

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
        const object = await loadGlbModel(file);
        if (object) addObject(object);
      });
    },
    [addObject]
  );

  return (
    <div
      className={cn(
        "w-full h-full relative",
        isDragging ? "bg-accent" : "bg-background"
      )}
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Canvas
        ref={canvasRef}
        className="w-full h-full"
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        shadows
        gl={{ alpha: true }}
        camera={{ fov: 50, near: 0.1, far: 1000 }}
      >
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

        <color attach="background" args={["#f2f2f2"]} />
        <Environment preset="apartment" />
        {/* <SceneGrid /> */}

        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport
            axisColors={["#ff3653", "#0adb50", "#2c8fdf"]}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>
    </div>
  );
};
