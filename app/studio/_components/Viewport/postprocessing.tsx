import React from "react";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

const Postprocessing = () => {
  return (
    <EffectComposer multisampling={8}>
      <Bloom
        intensity={0.2}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
};

export default Postprocessing;
