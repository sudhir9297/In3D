"use client";

import React from "react";
import {
  Bloom,
  EffectComposer,
  SSAO,
  Vignette,
  ChromaticAberration,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { usePostprocessingStore } from "../../store/postprocessingStore";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const Postprocessing = () => {
  const { bloom, ssao, vignette, chromaticAberration, colorCorrection } =
    usePostprocessingStore();

  return (
    <EffectComposer multisampling={8} disableNormalPass={false}>
      {/* 1. Ambient Occlusion */}
      {ssao.enabled ? (
        <SSAO
          intensity={ssao.intensity}
          radius={ssao.radius}
          luminanceInfluence={0.5}
          color={new THREE.Color("black")}
        />
      ) : (
        <></>
      )}

      {/* 2. Bloom */}
      {bloom.enabled ? (
        <Bloom
          intensity={bloom.intensity}
          luminanceThreshold={bloom.luminanceThreshold}
          luminanceSmoothing={bloom.luminanceSmoothing}
          mipmapBlur={bloom.mipmapBlur}
        />
      ) : (
        <></>
      )}

      {/* 3. Vignette */}
      {vignette.enabled ? (
        <Vignette
          eskil={false}
          offset={vignette.offset}
          darkness={vignette.darkness}
        />
      ) : (
        <></>
      )}

      {/* 4. Chromatic Aberration */}
      {chromaticAberration.enabled ? (
        <ChromaticAberration
          offset={
            new THREE.Vector2(
              chromaticAberration.offset[0],
              chromaticAberration.offset[1],
            )
          }
        />
      ) : (
        <></>
      )}

      {/* 5. Brightness & Contrast */}
      {colorCorrection.enabled ? (
        <BrightnessContrast
          brightness={colorCorrection.brightness}
          contrast={colorCorrection.contrast}
        />
      ) : (
        <></>
      )}
    </EffectComposer>
  );
};

export default Postprocessing;
