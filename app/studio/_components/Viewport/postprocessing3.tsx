"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useState } from "react";
import { PostProcessing } from "three/webgpu";
import { N8AONode, createN8AOScenePass } from "n8ao-webgpu";

import { usePostprocessingStore } from "../../store/postprocessingStore";

const N8AO_QUALITY_BY_PRESET = {
  performance: {
    mode: "Performance",
    aoSamples: 8,
    denoiseSamples: 4,
    denoiseRadius: 12,
  },
  default: {
    mode: "Medium",
    aoSamples: 16,
    denoiseSamples: 8,
    denoiseRadius: 12,
  },
  balanced: {
    mode: "Medium",
    aoSamples: 16,
    denoiseSamples: 8,
    denoiseRadius: 12,
  },
  high: {
    mode: "High",
    aoSamples: 64,
    denoiseSamples: 8,
    denoiseRadius: 6,
  },
} as const;

const Postprocessing3 = () => {
  const { gl, scene, camera, size } = useThree();
  const isWebGpuRenderer = Boolean(
    (gl as { isWebGPURenderer?: boolean } | null)?.isWebGPURenderer,
  );
  const qualityPreset = usePostprocessingStore((state) => state.qualityPreset);
  const n8aoSettings = usePostprocessingStore((state) => state.n8ao);
  const setActivePipeline = usePostprocessingStore(
    (state) => state.setActivePipeline,
  );
  const [postProcessing] = useState(() =>
    isWebGpuRenderer ? new PostProcessing(gl as never) : null,
  );
  const [pipeline] = useState(() => {
    if (!isWebGpuRenderer) {
      return null;
    }

    const scenePass = createN8AOScenePass(scene, camera);
    const nextN8ao = new N8AONode({
      beautyNode: scenePass.getTextureNode("output"),
      beautyTexture: scenePass.getTexture("output"),
      depthNode: scenePass.getTextureNode("depth"),
      depthTexture: scenePass.getTexture("depth"),
      normalNode: scenePass.getTextureNode("normal"),
      normalTexture: scenePass.getTexture("normal"),
      scenePassNode: scenePass,
      scene,
      camera,
    });

    nextN8ao.configuration.screenSpaceRadius = true;
    nextN8ao.configuration.distanceFalloff = 1;
    nextN8ao.configuration.gammaCorrection = false;
    nextN8ao.configuration.halfRes = false;
    nextN8ao.configuration.depthAwareUpsampling = false;
    nextN8ao.configuration.colorMultiply = true;

    return {
      n8ao: nextN8ao,
      scenePass,
    };
  });
  const n8ao = pipeline?.n8ao ?? null;
  const scenePass = pipeline?.scenePass ?? null;

  useEffect(() => {
    setActivePipeline("n8ao");
  }, [setActivePipeline]);

  useLayoutEffect(() => {
    if (!isWebGpuRenderer || !postProcessing || !n8ao || !scenePass) {
      return;
    }

    postProcessing.outputNode = n8aoSettings.enabled
      ? n8ao.getTextureNode()
      : scenePass.getTextureNode("output");
    postProcessing.needsUpdate = true;

    return () => {
      postProcessing.outputNode = null as never;
      postProcessing.needsUpdate = true;
    };
  }, [isWebGpuRenderer, n8ao, n8aoSettings.enabled, postProcessing, scenePass]);

  useEffect(() => {
    if (!n8ao) {
      return;
    }

    const quality = N8AO_QUALITY_BY_PRESET[qualityPreset];

    n8ao.setQualityMode(quality.mode);
    n8ao.configuration.aoSamples = quality.aoSamples;
    n8ao.configuration.denoiseSamples = quality.denoiseSamples;
    n8ao.configuration.denoiseRadius = quality.denoiseRadius;
    n8ao.configuration.aoRadius = n8aoSettings.aoRadius;
    n8ao.configuration.intensity = n8aoSettings.intensity;
    n8ao.configuration.distanceFalloff = n8aoSettings.distanceFalloff;
    n8ao.configuration.screenSpaceRadius = n8aoSettings.screenSpaceRadius;
    n8ao.configuration.halfRes = false;
    n8ao.configuration.depthAwareUpsampling = false;

    if (postProcessing) {
      postProcessing.needsUpdate = true;
    }
  }, [n8ao, n8aoSettings, postProcessing, qualityPreset]);

  useEffect(() => {
    if (!n8ao) {
      return;
    }

    n8ao.setSize(size.width, size.height);
    if (postProcessing) {
      postProcessing.needsUpdate = true;
    }
  }, [n8ao, postProcessing, size.height, size.width]);

  useEffect(() => {
    return () => {
      n8ao?.dispose();
    };
  }, [n8ao]);

  useFrame(({ gl: activeGl, scene: activeScene, camera: activeCamera }) => {
    if (!isWebGpuRenderer || !postProcessing) {
      activeGl.render(activeScene, activeCamera);
      return;
    }

    postProcessing.render();
  }, 1);

  return null;
};

export default Postprocessing3;
