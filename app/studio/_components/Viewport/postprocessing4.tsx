"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color, UnsignedByteType } from "three";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { denoise } from "three/examples/jsm/tsl/display/DenoiseNode.js";
import { ssgi } from "three/examples/jsm/tsl/display/SSGINode.js";
import { ssr } from "three/examples/jsm/tsl/display/SSRNode.js";
import {
  add,
  colorToDirection,
  diffuseColor,
  directionToColor,
  emissive,
  float,
  mix,
  metalness,
  mrt,
  normalView,
  output,
  pass,
  roughness,
  sample,
  uniform,
  vec2,
  vec4,
} from "three/tsl";
import { RenderPipeline, type WebGPURenderer } from "three/webgpu";

import { useEnvironmentStore } from "../../store/environmentStore";
import { usePostprocessingStore } from "../../store/postprocessingStore";

const SSGI_PARAMS = {
  enabled: true,
  sliceCount: 1,
  stepCount: 4,
  radius: 1,
  expFactor: 1.5,
  thickness: 0.5,
  backfaceLighting: 0.5,
  aoIntensity: 1.5,
  giIntensity: 0,
  useLinearThickness: false,
  useScreenSpaceSampling: true,
  useTemporalFiltering: false,
} as const;

const Postprocessing4 = () => {
  const { gl: renderer, scene, camera } = useThree();
  const backgroundColor = useEnvironmentStore((state) => state.backgroundColor);
  const bloomSettings = usePostprocessingStore((state) => state.bloom);
  const ssrSettings = usePostprocessingStore((state) => state.ssr);
  const ssgiSettings = usePostprocessingStore((state) => state.ssgi);
  const setActivePipeline = usePostprocessingStore(
    (state) => state.setActivePipeline,
  );
  const renderPipelineRef = useRef<RenderPipeline | null>(null);
  const hasPipelineErrorRef = useRef(false);
  const bgUniform = useRef(uniform(new Color(backgroundColor)));

  useEffect(() => {
    setActivePipeline("editor");
  }, [setActivePipeline]);

  useEffect(() => {
    bgUniform.current.value.set(backgroundColor);
  }, [backgroundColor]);

  useEffect(() => {
    if (!(renderer && scene && camera)) {
      return;
    }

    const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;
    if (!hasWebGPU) {
      console.warn(
        "[Viewer] WebGPU unavailable — rendering without post-processing4.",
      );
      hasPipelineErrorRef.current = true;
      renderPipelineRef.current = null;
      return;
    }

    hasPipelineErrorRef.current = false;

    try {
      const scenePass = pass(scene, camera);
      const scenePassColor = scenePass.getTextureNode("output");
      const hasGeometry = scenePassColor.a;

      let sceneColor: any = scenePassColor;

      if (ssgiSettings.enabled || ssrSettings.enabled) {
        scenePass.setMRT(
          mrt({
            output,
            diffuseColor,
            normal: directionToColor(normalView),
            metalrough: vec2(metalness, roughness),
          }),
        );

        const scenePassDiffuse = scenePass.getTextureNode("diffuseColor");
        const scenePassDepth = scenePass.getTextureNode("depth");
        const scenePassNormal = scenePass.getTextureNode("normal");
        const scenePassMetalRough = scenePass.getTextureNode("metalrough");

        const diffuseTexture = scenePass.getTexture("diffuseColor");
        diffuseTexture.type = UnsignedByteType;
        const normalTexture = scenePass.getTexture("normal");
        normalTexture.type = UnsignedByteType;

        const sceneNormal = sample((uv) =>
          colorToDirection(scenePassNormal.sample(uv)),
        );

        let litBase = scenePassColor as unknown as ReturnType<typeof vec4>;

        if (ssgiSettings.enabled) {
          const giPass = ssgi(
            scenePassColor,
            scenePassDepth,
            sceneNormal,
            camera as any,
          );
          giPass.sliceCount.value = ssgiSettings.sliceCount;
          giPass.stepCount.value = ssgiSettings.stepCount;
          giPass.radius.value = ssgiSettings.radius;
          giPass.expFactor.value = SSGI_PARAMS.expFactor;
          giPass.thickness.value = ssgiSettings.thickness;
          giPass.backfaceLighting.value = SSGI_PARAMS.backfaceLighting;
          giPass.aoIntensity.value = ssgiSettings.aoIntensity;
          giPass.giIntensity.value = ssgiSettings.giIntensity;
          giPass.useLinearThickness.value = SSGI_PARAMS.useLinearThickness;
          giPass.useScreenSpaceSampling.value =
            SSGI_PARAMS.useScreenSpaceSampling;
          giPass.useTemporalFiltering = SSGI_PARAMS.useTemporalFiltering;

          const giTexture = (giPass as any).getTextureNode();
          const aoAsRgb = vec4(giTexture.a, giTexture.a, giTexture.a, float(1));
          const denoisePass = denoise(
            aoAsRgb,
            scenePassDepth,
            sceneNormal,
            camera,
          );
          denoisePass.index.value = 0;
          denoisePass.radius.value = 4;

          const gi = giPass.rgb;
          const ao = (denoisePass as any).r;

          litBase = vec4(
            add(scenePassColor.rgb.mul(ao), scenePassDiffuse.rgb.mul(gi)),
            hasGeometry,
          );
        }

        if (ssrSettings.enabled) {
          const ssrPass = ssr(
            scenePassColor,
            scenePassDepth,
            sceneNormal,
            scenePassMetalRough.r,
            scenePassMetalRough.g,
          );
          ssrPass.maxDistance.value = ssrSettings.maxDistance;
          ssrPass.blurQuality.value = ssrSettings.blurQuality;
          ssrPass.thickness.value = ssrSettings.thickness;

          sceneColor = vec4(add(litBase.rgb, ssrPass.rgb), litBase.a);
        } else {
          sceneColor = litBase;
        }
      }

      const scenePassBloom = pass(scene, camera);
      scenePassBloom.setMRT(
        mrt({
          output,
          emissive,
        }),
      );

      const bloomSource = scenePassBloom.getTextureNode("emissive");
      const bloomPass = bloom(
        bloomSource,
        bloomSettings.strength,
        bloomSettings.radius,
        bloomSettings.threshold,
      );
      sceneColor = bloomSettings.enabled ? sceneColor.add(bloomPass) : sceneColor;

      const sceneWithBackground = mix(bgUniform.current, scenePassColor.rgb, hasGeometry);
      const finalColor = sceneWithBackground.add(sceneColor.rgb.sub(scenePassColor.rgb));
      const finalOutput = vec4(finalColor, float(1));

      const renderPipeline = new RenderPipeline(
        renderer as unknown as WebGPURenderer,
      );
      renderPipeline.outputNode = finalOutput;
      renderPipelineRef.current = renderPipeline;
    } catch (error) {
      hasPipelineErrorRef.current = true;
      console.error(
        "[Viewer] Failed to set up post-processing4 pipeline. Rendering without post FX.",
        error,
      );
      renderPipelineRef.current?.dispose();
      renderPipelineRef.current = null;
    }

    return () => {
      renderPipelineRef.current?.dispose();
      renderPipelineRef.current = null;
    };
  }, [backgroundColor, bloomSettings, camera, renderer, scene, ssrSettings, ssgiSettings]);

  useFrame(() => {
    if (hasPipelineErrorRef.current || !renderPipelineRef.current) {
      (renderer as any).render(scene, camera);
      return;
    }

    try {
      if ((renderer as any).setClearAlpha) {
        (renderer as any).setClearAlpha(0);
      }
      renderPipelineRef.current.render();
    } catch (error) {
      hasPipelineErrorRef.current = true;
      console.error("[Viewer] Post-processing4 render pass failed.", error);
      renderPipelineRef.current?.dispose();
      renderPipelineRef.current = null;
    }
  }, 1);

  return null;
};

export default Postprocessing4;
