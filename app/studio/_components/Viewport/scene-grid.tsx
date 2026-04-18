"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

function AxisLines() {
  return (
    <group position={[0, 0.01, 0]} userData={{ isGrid: true }}>
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-18, 0, 0, 18, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#c45c52"
          transparent
          opacity={0.48}
          depthWrite={false}
        />
      </line>

      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, -18, 0, 0, 18]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#4f7398"
          transparent
          opacity={0.48}
          depthWrite={false}
        />
      </line>
    </group>
  );
}

function HelperGrid() {
  const grid = useMemo(() => {
    const helper = new THREE.GridHelper(100, 100, "#a9a299", "#d2cbc2");
    helper.position.set(0, 0.001, 0);
    helper.userData = { isGrid: true };

    const materials = Array.isArray(helper.material)
      ? helper.material
      : [helper.material];

    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.58;
      material.depthWrite = false;
      material.toneMapped = false;
    });

    return helper;
  }, []);

  return <primitive object={grid} raycast={() => null} />;
}

function SceneGrid() {
  return (
    <>
      <HelperGrid />
      <AxisLines />
    </>
  );
}

export default SceneGrid;
