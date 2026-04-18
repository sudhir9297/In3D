"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

import { useEnvironmentStore } from "../store/environmentStore";
import { useLightingStore } from "../store/lightingStore";
import { useMaterialStore } from "../store/materialStore";
import { useModelStore } from "../store/modelStore";
import { usePostprocessingStore } from "../store/postprocessingStore";
import { useViewportStore } from "../store/viewportStore";

export function useViewportRenderInvalidation() {
  const invalidate = useThree((state) => state.invalidate);
  const sceneVersion = useModelStore((state) => state.sceneVersion);
  const selectionVersion = useModelStore((state) => state.selectionVersion);
  const uiVersion = useViewportStore((state) => state.uiVersion);
  const environmentVersion = useEnvironmentStore((state) => state.renderVersion);
  const lightingVersion = useLightingStore((state) => state.renderVersion);
  const postprocessingVersion = usePostprocessingStore(
    (state) => state.renderVersion,
  );
  const materialVersion = useMaterialStore((state) => state.renderVersion);

  useEffect(() => {
    invalidate();
  }, [
    invalidate,
    sceneVersion,
    selectionVersion,
    uiVersion,
    environmentVersion,
    lightingVersion,
    postprocessingVersion,
    materialVersion,
  ]);
}
