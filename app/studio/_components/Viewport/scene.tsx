import React, { useRef } from "react";
import { ModelStore, useModelStore } from "../../store/modelStore";
import { Matrix4, Object3D, Quaternion, Vector3 } from "three";
import { PivotControls } from "@react-three/drei";

const Scene = () => {
  const worldMatrixRef = useRef(new Matrix4());
  const { objects, setSelectedObject, selectedObject } = useModelStore(
    (state: ModelStore) => state
  );

  const handleClick = (object: Object3D): void => {
    // we will be handling the selection logic here with filtration later on
    setSelectedObject(object);
  };

  // Capture drag world matrix continuously
  const handleOnDrag = (worldMatrix: Matrix4) => {
    worldMatrixRef.current.copy(worldMatrix);
  };

  // Apply full transform (position + rotation + scale) from world matrix
  const handleOnDragEnd = () => {
    if (selectedObject && worldMatrixRef.current) {
      const parent = selectedObject.parent;
      if (parent) {
        const parentInverseMatrixWorld = new Matrix4()
          .copy(parent.matrixWorld)
          .invert();

        const localMatrix = new Matrix4()
          .copy(parentInverseMatrixWorld)
          .multiply(worldMatrixRef.current);

        const pos = new Vector3();
        const quat = new Quaternion();
        const scale = new Vector3();
        localMatrix.decompose(pos, quat, scale);

        selectedObject.position.copy(pos);
        selectedObject.quaternion.copy(quat);
        selectedObject.scale.copy(scale);
      } else {
        const pos = new Vector3();
        const quat = new Quaternion();
        const scale = new Vector3();
        worldMatrixRef.current.decompose(pos, quat, scale);

        selectedObject.position.copy(pos);
        selectedObject.quaternion.copy(quat);
        selectedObject.scale.copy(scale);
      }

      selectedObject.updateMatrixWorld();
    }
  };

  return (
    <>
      {objects.map((object, index: number) => (
        <Model key={index} object={object} onSelect={handleClick} />
      ))}

      {selectedObject && (
        <PivotControls
          anchor={[0, 0, 0]}
          scale={1}
          depthTest={false}
          lineWidth={2}
          matrix={selectedObject.matrixWorld.clone()}
          onDrag={(local, delta, world) => handleOnDrag(world)}
          onDragEnd={handleOnDragEnd}
        >
          <mesh visible={false}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </PivotControls>
      )}
    </>
  );
};

export default Scene;

function Model({
  object,
  onSelect,
}: {
  object: Object3D;
  onSelect: (e: Object3D) => void;
}) {
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e.object);
      }}
    >
      <primitive object={object} />
    </group>
  );
}
