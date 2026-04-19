"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { useEnvironmentStore } from "../../store/environmentStore";
import {
  LightingPreset,
  useLightingStore,
} from "../../store/lightingStore";
import {
  usePostprocessingStore,
} from "../../store/postprocessingStore";
import {
  SHADOW_MAP_SIZES,
} from "../../utils/renderQuality";

type LightingPalette = {
  sunColor: string;
  ambientColor: string;
  skyColor: string;
  groundColor: string;
  sunIntensity: number;
  fillIntensity: number;
  ambientBoost: number;
  azimuthBias: number;
  elevationBias: number;
  focusBias: number;
};

function mixColor(colorA: string, colorB: string, amount: number) {
  return `#${new THREE.Color(colorA).lerp(new THREE.Color(colorB), amount).getHexString()}`;
}

function getDayFactor(time: number) {
  return Math.max(0, Math.sin((time / 100) * Math.PI));
}

function getEdgeFactor(time: number) {
  return Math.abs(time / 100 - 0.5) * 2;
}

const PRESET_LABELS: Record<LightingPreset, LightingPalette> = {
  dawn: {
    sunColor: "#f4b36f",
    ambientColor: "#7a6550",
    skyColor: "#e6d4c0",
    groundColor: "#f3e5d5",
    sunIntensity: 2.65,
    fillIntensity: 0.72,
    ambientBoost: 0.18,
    azimuthBias: -12,
    elevationBias: -8,
    focusBias: -0.4,
  },
  golden: {
    sunColor: "#f59d4f",
    ambientColor: "#866346",
    skyColor: "#e9ccb2",
    groundColor: "#f7e0c2",
    sunIntensity: 2.95,
    fillIntensity: 0.84,
    ambientBoost: 0.22,
    azimuthBias: -4,
    elevationBias: -2,
    focusBias: -0.2,
  },
  morning: {
    sunColor: "#ffe1a8",
    ambientColor: "#98aac4",
    skyColor: "#d9e5f5",
    groundColor: "#eef4fa",
    sunIntensity: 3.1,
    fillIntensity: 1,
    ambientBoost: 0.24,
    azimuthBias: 10,
    elevationBias: 2,
    focusBias: 0.1,
  },
  brunch: {
    sunColor: "#fff0c7",
    ambientColor: "#b8c4d9",
    skyColor: "#edf1f6",
    groundColor: "#f7f6ef",
    sunIntensity: 3.25,
    fillIntensity: 1.08,
    ambientBoost: 0.28,
    azimuthBias: 18,
    elevationBias: 6,
    focusBias: 0.2,
  },
  dusk: {
    sunColor: "#ffb06c",
    ambientColor: "#544d70",
    skyColor: "#c9c0d7",
    groundColor: "#d6c8c0",
    sunIntensity: 2.35,
    fillIntensity: 0.62,
    ambientBoost: 0.16,
    azimuthBias: 26,
    elevationBias: -10,
    focusBias: 0.45,
  },
};

function formatPalette(preset: LightingPreset, time: number): LightingPalette {
  const palette = PRESET_LABELS[preset];
  const dayFactor = getDayFactor(time);
  const edgeFactor = getEdgeFactor(time);
  const warmMix = edgeFactor * 0.4 + (preset === "golden" ? 0.12 : 0);
  const shadowBoost = preset === "dusk" ? 0.78 : 1;

  return {
    ...palette,
    sunColor: mixColor("#fff5df", palette.sunColor, warmMix),
    ambientColor: mixColor("#2a3140", palette.ambientColor, 0.35 + dayFactor * 0.65),
    skyColor: mixColor(
      "#20283a",
      mixColor("#eef2f7", palette.skyColor, warmMix),
      0.14 + dayFactor * 0.86,
    ),
    groundColor: mixColor("#2e3138", palette.groundColor, 0.18 + dayFactor * 0.82),
    sunIntensity: palette.sunIntensity * (0.18 + dayFactor * 1.1),
    fillIntensity: palette.fillIntensity * (0.18 + dayFactor * 0.92),
    ambientBoost: palette.ambientBoost * (0.3 + dayFactor * 0.7) * shadowBoost,
  };
}

export function SunLightRig() {
  const initialLightingState = useRef(useLightingStore.getState());
  const initialEnvironmentState = useRef(useEnvironmentStore.getState());
  const hemisphereRef = useRef<THREE.HemisphereLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const scene = useThree((state) => state.scene);
  const smoothedBackgroundRef = useRef(new THREE.Color());
  const targetBackgroundRef = useRef(new THREE.Color());
  const sunPositionRef = useRef(new THREE.Vector3());
  const fillPositionRef = useRef(new THREE.Vector3());
  const targetPositionRef = useRef(new THREE.Vector3());
  const fillTargetPositionRef = useRef(new THREE.Vector3());
  const skyColorRef = useRef(new THREE.Color());
  const groundColorRef = useRef(new THREE.Color());
  const ambientColorRef = useRef(new THREE.Color());
  const sunColorRef = useRef(new THREE.Color());
  const lightingStateRef = useRef({
    currentTime: initialLightingState.current.currentTime,
    preset: initialLightingState.current.preset,
    orientation: initialLightingState.current.orientation,
    palette: formatPalette(
      initialLightingState.current.preset,
      initialLightingState.current.currentTime,
    ),
  });
  const environmentStateRef = useRef({
    backgroundImage: initialEnvironmentState.current.backgroundImage,
    showHDR: initialEnvironmentState.current.showHDR,
  });

  const qualityPreset = usePostprocessingStore((state) => state.qualityPreset);
  const autoQuality = usePostprocessingStore((state) => state.autoQuality);
  const lowerQuality = usePostprocessingStore((state) => state.lowerQuality);
  const raiseQuality = usePostprocessingStore((state) => state.raiseQuality);
  const shadowMapSize = SHADOW_MAP_SIZES[qualityPreset];
  const enableFillLight = qualityPreset !== "performance";

  useEffect(() => {
    const unsubscribeLighting = useLightingStore.subscribe((state) => {
      lightingStateRef.current = {
        currentTime: state.currentTime,
        preset: state.preset,
        orientation: state.orientation,
        palette: formatPalette(state.preset, state.currentTime),
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
    if (targetRef.current && directionalRef.current) {
      directionalRef.current.target = targetRef.current;
    }

    if (targetRef.current && fillRef.current) {
      fillRef.current.target = targetRef.current;
    }
  }, [enableFillLight]);

  useEffect(() => {
    return () => {
      scene.background = null;
    };
  }, [scene]);

  useFrame((_, delta) => {
    if (!directionalRef.current || !targetRef.current) {
      return;
    }

    const { currentTime, preset, orientation, palette } = lightingStateRef.current;
    const { backgroundImage, showHDR } = environmentStateRef.current;
    const presetConfig = PRESET_LABELS[preset];
    const orientationAngle = THREE.MathUtils.degToRad(orientation);
    const timeProgress = currentTime / 100;
    const radius = 18;
    const dayFactor = getDayFactor(currentTime);
    const sweepAngle = THREE.MathUtils.degToRad(
      THREE.MathUtils.lerp(-110, 78, timeProgress) + presetConfig.azimuthBias,
    );
    const elevationAngle = THREE.MathUtils.degToRad(
      THREE.MathUtils.lerp(-6, 68, dayFactor) + presetConfig.elevationBias,
    );
    const azimuthAngle = orientationAngle + sweepAngle;
    const planarRadius = Math.max(3, Math.cos(elevationAngle) * radius);
    const sunHeight = Math.sin(elevationAngle) * radius + THREE.MathUtils.lerp(-2, 1.5, dayFactor);
    const x = Math.sin(azimuthAngle) * planarRadius;
    const z = Math.cos(azimuthAngle) * planarRadius;
    const focusDistance = 2.2 + presetConfig.focusBias + THREE.MathUtils.lerp(-0.8, 0.8, timeProgress);
    const targetX = Math.sin(orientationAngle) * focusDistance;
    const targetZ = Math.cos(orientationAngle) * focusDistance;
    const smooth = 1 - Math.exp(-delta * 4);
    const colorSmooth = 1 - Math.exp(-delta * 2.4);

    sunPositionRef.current.set(x, sunHeight, z);
    fillPositionRef.current.set(
      -x * 0.35,
      Math.max(1, sunHeight * 0.42),
      -z * 0.28,
    );
    targetPositionRef.current.set(targetX, 1.8, targetZ);
    fillTargetPositionRef.current.set(targetX * 0.6, 1.2, targetZ * 0.6);

    directionalRef.current.position.lerp(sunPositionRef.current, smooth);
    fillRef.current?.position.lerp(fillPositionRef.current, smooth);

    directionalRef.current.target.position.lerp(targetPositionRef.current, smooth);
    fillRef.current?.target.position.lerp(fillTargetPositionRef.current, smooth);

    directionalRef.current.target.updateMatrixWorld();
    fillRef.current?.target.updateMatrixWorld();

    if (!backgroundImage && !showHDR) {
      const sceneBackground =
        scene.background instanceof THREE.Color
          ? scene.background
          : targetBackgroundRef.current;
      targetBackgroundRef.current.set(palette.skyColor);

      smoothedBackgroundRef.current.copy(sceneBackground);
      smoothedBackgroundRef.current.lerp(targetBackgroundRef.current, colorSmooth);
      scene.background = smoothedBackgroundRef.current;
    }

    skyColorRef.current.set(palette.skyColor);
    groundColorRef.current.set(palette.groundColor);
    ambientColorRef.current.set(palette.ambientColor);
    sunColorRef.current.set(palette.sunColor);

    hemisphereRef.current?.color.lerp(skyColorRef.current, colorSmooth);
    hemisphereRef.current?.groundColor.lerp(groundColorRef.current, colorSmooth);
    if (hemisphereRef.current) {
      hemisphereRef.current.intensity = THREE.MathUtils.lerp(
        hemisphereRef.current.intensity,
        0.22 + getDayFactor(currentTime) * 0.28,
        colorSmooth,
      );
    }

    ambientRef.current?.color.lerp(ambientColorRef.current, colorSmooth);
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        0.04 + palette.ambientBoost,
        colorSmooth,
      );
    }

    directionalRef.current.color.lerp(sunColorRef.current, colorSmooth);
    directionalRef.current.intensity = THREE.MathUtils.lerp(
      directionalRef.current.intensity,
      palette.sunIntensity,
      colorSmooth,
    );

    if (fillRef.current) {
      fillRef.current.color.lerp(ambientColorRef.current, colorSmooth);
      fillRef.current.intensity = THREE.MathUtils.lerp(
        fillRef.current.intensity,
        palette.fillIntensity,
        colorSmooth,
      );
    }
  }, 1);

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

      <object3D ref={targetRef} position={[0, 1.8, 0]} />

      <hemisphereLight
        ref={hemisphereRef}
        args={[
          lightingStateRef.current.palette.skyColor,
          lightingStateRef.current.palette.groundColor,
          0.22 + getDayFactor(lightingStateRef.current.currentTime) * 0.28,
        ]}
      />

      <ambientLight
        ref={ambientRef}
        intensity={0.04 + lightingStateRef.current.palette.ambientBoost}
        color={lightingStateRef.current.palette.ambientColor}
      />

      <directionalLight
        ref={directionalRef}
        color={lightingStateRef.current.palette.sunColor}
        intensity={lightingStateRef.current.palette.sunIntensity}
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

      {enableFillLight ? (
        <directionalLight
          ref={fillRef}
          color={lightingStateRef.current.palette.ambientColor}
          intensity={lightingStateRef.current.palette.fillIntensity}
          castShadow={false}
        />
      ) : null}
    </>
  );
}
