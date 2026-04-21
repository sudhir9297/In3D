"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useEnvironmentStore } from "../../store/environmentStore";
import { useLightingStore } from "../../store/lightingStore";
import { usePostprocessingStore } from "../../store/postprocessingStore";
import { SHADOW_MAP_SIZES } from "../../utils/renderQuality";
import {
  getStylizedBackgroundHex,
  getStylizedLightState,
} from "../../utils/stylizedLighting";

export function SunLightRig() {
  const initialLightingState = useRef(useLightingStore.getState());
  const initialEnvironmentState = useRef(useEnvironmentStore.getState());
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const keyTargetRef = useRef<THREE.Object3D>(null);
  const fillTargetRef = useRef<THREE.Object3D>(null);
  const rimTargetRef = useRef<THREE.Object3D>(null);
  const scene = useThree((state) => state.scene);
  const smoothedBackgroundRef = useRef(new THREE.Color());
  const targetBackgroundRef = useRef(new THREE.Color());
  const ambientColorRef = useRef(new THREE.Color());
  const keyColorRef = useRef(new THREE.Color());
  const fillColorRef = useRef(new THREE.Color());
  const rimColorRef = useRef(new THREE.Color());
  const lightingStateRef = useRef({
    currentTime: initialLightingState.current.currentTime,
    orientation: initialLightingState.current.orientation,
  });
  const environmentStateRef = useRef({
    backgroundImage: initialEnvironmentState.current.backgroundImage,
    showHDR: initialEnvironmentState.current.showHDR,
  });
  const tempVectors = useMemo(
    () => ({
      keyPosition: new THREE.Vector3(),
      fillPosition: new THREE.Vector3(),
      rimPosition: new THREE.Vector3(),
      keyTarget: new THREE.Vector3(),
      fillTarget: new THREE.Vector3(),
      rimTarget: new THREE.Vector3(),
    }),
    [],
  );

  const qualityPreset = usePostprocessingStore((state) => state.qualityPreset);
  const autoQuality = usePostprocessingStore((state) => state.autoQuality);
  const lowerQuality = usePostprocessingStore((state) => state.lowerQuality);
  const raiseQuality = usePostprocessingStore((state) => state.raiseQuality);
  const shadowMapSize = SHADOW_MAP_SIZES[qualityPreset];
  const enableSecondaryLights = qualityPreset !== "performance";

  useEffect(() => {
    const unsubscribeLighting = useLightingStore.subscribe((state) => {
      lightingStateRef.current = {
        currentTime: state.currentTime,
        orientation: state.orientation,
      };
    });

    const unsubscribeEnvironment = useEnvironmentStore.subscribe((state) => {
      environmentStateRef.current = {
        backgroundImage: state.backgroundImage,
        showHDR: state.showHDR,
      };
    });

    return () => {
      unsubscribeLighting();
      unsubscribeEnvironment();
    };
  }, []);

  useEffect(() => {
    if (keyTargetRef.current && keyRef.current) {
      keyRef.current.target = keyTargetRef.current;
    }

    if (fillTargetRef.current && fillRef.current) {
      fillRef.current.target = fillTargetRef.current;
    }

    if (rimTargetRef.current && rimRef.current) {
      rimRef.current.target = rimTargetRef.current;
    }
  }, [enableSecondaryLights]);

  useEffect(() => {
    return () => {
      scene.background = null;
    };
  }, [scene]);

  useFrame((_, delta) => {
    if (!keyRef.current || !keyTargetRef.current) {
      return;
    }

    const { currentTime, orientation } = lightingStateRef.current;
    const { backgroundImage, showHDR } = environmentStateRef.current;
    const smooth = 1 - Math.exp(-delta * 4);
    const colorSmooth = 1 - Math.exp(-delta * 2.4);

    const keyState = getStylizedLightState("key", currentTime, orientation);
    const fillState = getStylizedLightState("fill", currentTime, orientation);
    const rimState = getStylizedLightState("rim", currentTime, orientation);
    const ambientState = getStylizedLightState("ambient", currentTime, orientation);

    tempVectors.keyPosition.set(...(keyState.position ?? [0, 8, 0]));
    tempVectors.fillPosition.set(...(fillState.position ?? [0, 3, 0]));
    tempVectors.rimPosition.set(...(rimState.position ?? [0, 4, 0]));
    tempVectors.keyTarget.set(...(keyState.target ?? [0, 1.8, 0]));
    tempVectors.fillTarget.set(...(fillState.target ?? [0, 1.2, 0]));
    tempVectors.rimTarget.set(...(rimState.target ?? [0, 1.6, 0]));

    keyRef.current.position.lerp(tempVectors.keyPosition, smooth);
    keyRef.current.target.position.lerp(tempVectors.keyTarget, smooth);
    keyRef.current.target.updateMatrixWorld();

    if (fillRef.current) {
      fillRef.current.position.lerp(tempVectors.fillPosition, smooth);
      fillRef.current.target.position.lerp(tempVectors.fillTarget, smooth);
      fillRef.current.target.updateMatrixWorld();
    }

    if (rimRef.current) {
      rimRef.current.position.lerp(tempVectors.rimPosition, smooth);
      rimRef.current.target.position.lerp(tempVectors.rimTarget, smooth);
      rimRef.current.target.updateMatrixWorld();
    }

    if (!backgroundImage && !showHDR) {
      const sceneBackground =
        scene.background instanceof THREE.Color
          ? scene.background
          : targetBackgroundRef.current;
      targetBackgroundRef.current.set(getStylizedBackgroundHex(currentTime));
      smoothedBackgroundRef.current.copy(sceneBackground);
      smoothedBackgroundRef.current.lerp(targetBackgroundRef.current, colorSmooth);
      scene.background = smoothedBackgroundRef.current;
    }

    ambientColorRef.current.set(ambientState.color);
    keyColorRef.current.set(keyState.color);
    fillColorRef.current.set(fillState.color);
    rimColorRef.current.set(rimState.color);

    if (ambientRef.current) {
      ambientRef.current.color.lerp(ambientColorRef.current, colorSmooth);
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        ambientState.intensity,
        colorSmooth,
      );
    }

    keyRef.current.color.lerp(keyColorRef.current, colorSmooth);
    keyRef.current.intensity = THREE.MathUtils.lerp(
      keyRef.current.intensity,
      keyState.intensity,
      colorSmooth,
    );
    if (keyRef.current.shadow) {
      const shadow = keyRef.current.shadow as THREE.LightShadow & {
        intensity?: number;
      };
      shadow.intensity = THREE.MathUtils.lerp(
        shadow.intensity ?? keyState.shadowStrength,
        keyState.shadowStrength,
        colorSmooth,
      );
    }

    if (fillRef.current) {
      fillRef.current.color.lerp(fillColorRef.current, colorSmooth);
      fillRef.current.intensity = THREE.MathUtils.lerp(
        fillRef.current.intensity,
        fillState.intensity,
        colorSmooth,
      );
    }

    if (rimRef.current) {
      rimRef.current.color.lerp(rimColorRef.current, colorSmooth);
      rimRef.current.intensity = THREE.MathUtils.lerp(
        rimRef.current.intensity,
        rimState.intensity,
        colorSmooth,
      );
    }
  }, 1);

  const initialAmbientState = getStylizedLightState(
    "ambient",
    lightingStateRef.current.currentTime,
    lightingStateRef.current.orientation,
  );
  const initialKeyState = getStylizedLightState(
    "key",
    lightingStateRef.current.currentTime,
    lightingStateRef.current.orientation,
  );
  const initialFillState = getStylizedLightState(
    "fill",
    lightingStateRef.current.currentTime,
    lightingStateRef.current.orientation,
  );
  const initialRimState = getStylizedLightState(
    "rim",
    lightingStateRef.current.currentTime,
    lightingStateRef.current.orientation,
  );

  return (
    <>
      <PerformanceMonitor
        onDecline={() => {
          if (autoQuality) {
            lowerQuality();
          }
        }}
        onIncline={() => {
          if (autoQuality) {
            raiseQuality();
          }
        }}
      />

      <object3D ref={keyTargetRef} position={[0, 1.8, 0]} />
      <object3D ref={fillTargetRef} position={[0, 1.2, 0]} />
      <object3D ref={rimTargetRef} position={[0, 1.6, 0]} />

      <ambientLight
        ref={ambientRef}
        intensity={initialAmbientState.intensity}
        color={initialAmbientState.color}
      />

      <directionalLight
        ref={keyRef}
        color={initialKeyState.color}
        intensity={initialKeyState.intensity}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-bias={-0.0008}
        shadow-normalBias={0.02}
        shadow-radius={1.8}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-10, 10, 10, -10, 0.5, 60]}
        />
      </directionalLight>

      {enableSecondaryLights ? (
        <>
          <directionalLight
            ref={fillRef}
            color={initialFillState.color}
            intensity={initialFillState.intensity}
            castShadow={false}
          />
          <directionalLight
            ref={rimRef}
            color={initialRimState.color}
            intensity={initialRimState.intensity}
            castShadow={false}
          />
        </>
      ) : null}
    </>
  );
}
