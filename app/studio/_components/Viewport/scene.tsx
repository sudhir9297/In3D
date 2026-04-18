import React, { useEffect, useMemo, useRef } from "react";
import { ModelStore, useModelStore } from "../../store/modelStore";
import { Object3D } from "three";
import { TransformControls } from "@react-three/drei";
import { highlightMesh, extractMaterialProperties } from "../../utils/common";
import { useViewportStore } from "../../store/viewportStore";
import { useMaterialStore } from "../../store/materialStore";
import useClickOrDrag from "../../hooks/useClickOrDrag";
import { ThreeEvent } from "@react-three/fiber";

const resolveTransformTarget = (
  selectedObject: Object3D | null,
  rootObjects: Object3D[],
) => {
  if (!selectedObject) {
    return null;
  }

  let current: Object3D | null = selectedObject;

  while (current) {
    if (rootObjects.includes(current)) {
      return current;
    }
    current = current.parent;
  }

  return selectedObject;
};

const Scene = () => {
  const isTransformingRef = useRef(false);
  const objects = useModelStore((state: ModelStore) => state.objects);
  const setSelectedObject = useModelStore(
    (state: ModelStore) => state.setSelectedObject,
  );
  const selectedObject = useModelStore(
    (state: ModelStore) => state.selectedObject,
  );
  const isEditorMode = useViewportStore((state) => state.isEditorMode);
  const transformMode = useViewportStore((state) => state.transformMode);
  const beginInteraction = useViewportStore((state) => state.beginInteraction);
  const endInteraction = useViewportStore((state) => state.endInteraction);
  const setMaterial = useMaterialStore((state) => state.setMaterial);
  const setSelectedMesh = useMaterialStore((state) => state.setSelectedMesh);
  const clearMaterial = useMaterialStore((state) => state.clearMaterial);
  const transformTarget = useMemo(
    () => resolveTransformTarget(selectedObject, objects),
    [objects, selectedObject],
  );

  useEffect(() => {
    if (selectedObject) {
      highlightMesh(selectedObject);
      // Extract and store material properties
      const extracted = extractMaterialProperties(selectedObject);
      if (extracted) {
        setMaterial(extracted.maps, extracted.mapProperties);
        setSelectedMesh(selectedObject);
      }
    } else {
      clearMaterial();
    }
  }, [selectedObject, setMaterial, setSelectedMesh, clearMaterial]);

  const handleClick = (
    action: string,
    event: ThreeEvent<PointerEvent>,
  ): void => {
    event.stopPropagation();

    if (isTransformingRef.current) {
      return;
    }

    // we will be handling the selection logic here with filtration later on
    if (action === "click") {
      const object = event.object as Object3D;

      setSelectedObject(object);
    }
  };

  return (
    <>
      {objects.map((object) => (
        <Model key={object.uuid} object={object} onSelect={handleClick} />
      ))}

      {isEditorMode && transformTarget ? (
        <TransformControls
          object={transformTarget}
          mode={transformMode}
          size={0.9}
          onMouseDown={() => {
            isTransformingRef.current = true;
            beginInteraction();
          }}
          onObjectChange={() => {
            transformTarget.updateMatrixWorld(true);
          }}
          onMouseUp={() => {
            transformTarget.updateMatrixWorld(true);
            requestAnimationFrame(() => {
              isTransformingRef.current = false;
              endInteraction();
            });
          }}
        />
      ) : null}
    </>
  );
};

export default Scene;

function Model({
  object,
  onSelect,
}: {
  object: Object3D;
  onSelect: (action: string, event: ThreeEvent<PointerEvent>) => void;
}) {
  const { onMouseDown, onMouseUp } = useClickOrDrag();

  return (
    <group
      onPointerUp={(event) => onMouseUp(event, onSelect)}
      onPointerDown={onMouseDown}
    >
      <primitive object={object} />
    </group>
  );
}
