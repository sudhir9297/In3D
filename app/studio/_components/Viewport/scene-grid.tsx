import { Grid } from "@react-three/drei";
import React from "react";
import * as THREE from "three";

function AxisLines() {
  return (
    <group position={[0, 0.002, 0]} userData={{ isGrid: true }}>
      {/* X Axis - Red */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-10, 0, 0, 10, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="red"
          linewidth={0.7} // Note: may not be supported on all platforms
          transparent={true}
          opacity={0.3} // Lower opacity for subtle effect
          depthWrite={false}
          depthTest={true}
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </line>

      {/* Z Axis - Blue */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, -10, 0, 0, 10]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="blue"
          linewidth={0.7}
          transparent={true}
          opacity={0.3}
          depthWrite={false}
          depthTest={true}
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </line>
    </group>
  );
}

function SceneGrid() {
  return (
    <>
      <Grid
        position={[0, -0.005, 0]}
        args={[100, 100]}
        side={THREE.DoubleSide}
        cellColor={"#333333"}
        sectionColor={"#3c3c3c"}
        cellThickness={0.7}
        sectionThickness={1.1}
        fadeDistance={50}
        fadeStrength={3}
        userData={{ isGrid: true }}
        raycast={() => null}
      />
      <AxisLines />
    </>
  );
}

export default SceneGrid;
