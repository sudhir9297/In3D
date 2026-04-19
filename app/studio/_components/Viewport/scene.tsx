import React, { useEffect, useMemo, useRef } from "react";
import { ModelStore, useModelStore } from "../../store/modelStore";
import { Object3D } from "three";
import { TransformControls } from "@react-three/drei";
import {
  highlightMesh,
  extractMaterialProperties,
  getFirstMesh,
} from "../../utils/common";
import { useViewportStore } from "../../store/viewportStore";
import { useMaterialStore } from "../../store/materialStore";
import useClickOrDrag from "../../hooks/useClickOrDrag";
import { ThreeEvent, useThree } from "@react-three/fiber";

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
  const highlightTimelineRef = useRef<ReturnType<typeof highlightMesh>>(null);
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
  const invalidate = useThree((state) => state.invalidate);
  const transformTarget = useMemo(
    () => resolveTransformTarget(selectedObject, objects),
    [objects, selectedObject],
  );

  useEffect(() => {
    if (highlightTimelineRef.current) {
      highlightTimelineRef.current.progress(1);
      highlightTimelineRef.current.kill();
      highlightTimelineRef.current = null;
    }

    if (selectedObject) {
      highlightTimelineRef.current = highlightMesh(selectedObject, {
        onStart: invalidate,
        onUpdate: invalidate,
        onComplete: invalidate,
      });

      const selectedMesh = getFirstMesh(selectedObject);

      // Extract and store material properties
      const extracted = selectedMesh
        ? extractMaterialProperties(selectedMesh)
        : null;

      if (extracted && selectedMesh) {
        setMaterial(extracted.maps, extracted.mapProperties);
        setSelectedMesh(selectedMesh);
      } else {
        clearMaterial();
      }
    } else {
      clearMaterial();
    }

    return () => {
      if (highlightTimelineRef.current) {
        highlightTimelineRef.current.progress(1);
        highlightTimelineRef.current.kill();
        highlightTimelineRef.current = null;
        invalidate();
      }
    };
  }, [
    clearMaterial,
    invalidate,
    selectedObject,
    setMaterial,
    setSelectedMesh,
  ]);

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
