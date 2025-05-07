"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("model.glb");
  return <primitive object={scene} />;
}

export const ViewerWrapper = () => {
  return (
    <div className="w-full h-full flex-1">
      <Canvas
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
        <color attach="background" args={["#f2f2f2"]} />
        <Environment preset="apartment" />
        <Center>
          <Model />
        </Center>
        <OrbitControls />
      </Canvas>
    </div>
  );
};
