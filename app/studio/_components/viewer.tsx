"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useResponsiveCanvas } from "../hooks/useResponsiveCanvas";

function Model() {
  const { scene } = useGLTF("model.glb");
  return <primitive object={scene} />;
}

const Scene = () => {
  return (
    <>
      <color attach="background" args={["#f2f2f2"]} />
      <Environment preset="apartment" />
      <Center>
        <Model />
      </Center>
      <OrbitControls />
    </>
  );
};

export const ViewerWrapper = ({
  sidebarIsOpen,
}: {
  sidebarIsOpen: boolean;
}) => {
  const SIDEBAR_WIDTH = 300;

  const { containerRef, canvasRef } = useResponsiveCanvas(
    sidebarIsOpen,
    SIDEBAR_WIDTH
  );

  return (
    <div className="w-full h-full " ref={containerRef}>
      <Canvas
        ref={canvasRef}
        className="w-full h-full"
        gl={{
          preserveDrawingBuffer: true,
          localClippingEnabled: true,
          antialias: true,
        }}
        shadows
        dpr={[1, 1.5]}
        camera={{
          fov: 45,
          near: 0.1,
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};
