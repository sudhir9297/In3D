"use client";

import {
  Bloom,
  EffectComposer,
  SSAO,
  Vignette,
  ChromaticAberration,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { usePostprocessingStore } from "../../store/postprocessingStore";
import * as THREE from "three";

const Postprocessing = () => {
  const { bloom, ssao, vignette, chromaticAberration, colorCorrection } =
    usePostprocessingStore();
  const effects: React.ReactElement[] = [];

  if (ssao.enabled) {
    effects.push(
      <SSAO
        key="ssao"
        intensity={ssao.intensity}
        radius={ssao.radius}
        luminanceInfluence={0.5}
        color={new THREE.Color("black")}
      />,
    );
  }

  if (bloom.enabled) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={bloom.intensity}
        luminanceThreshold={bloom.luminanceThreshold}
        luminanceSmoothing={bloom.luminanceSmoothing}
        mipmapBlur={bloom.mipmapBlur}
      />,
    );
  }

  if (vignette.enabled) {
    effects.push(
      <Vignette
        key="vignette"
        eskil={false}
        offset={vignette.offset}
        darkness={vignette.darkness}
      />,
    );
  }

  if (chromaticAberration.enabled) {
    effects.push(
      <ChromaticAberration
        key="chromatic-aberration"
        offset={
          new THREE.Vector2(
            chromaticAberration.offset[0],
            chromaticAberration.offset[1],
          )
        }
      />,
    );
  }

  if (colorCorrection.enabled) {
    effects.push(
      <BrightnessContrast
        key="brightness-contrast"
        brightness={colorCorrection.brightness}
        contrast={colorCorrection.contrast}
      />,
    );
  }

  return (
    <EffectComposer multisampling={8} enableNormalPass>
      {effects}
    </EffectComposer>
  );
};

export default Postprocessing;
