"use client";

import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { ssgi } from "three/examples/jsm/tsl/display/SSGINode.js";
import { ssr } from "three/examples/jsm/tsl/display/SSRNode.js";
import { traa } from "three/examples/jsm/tsl/display/TRAANode.js";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { usePostprocessingStore } from "../../store/postprocessingStore";
import { useViewportStore } from "../../store/viewportStore";
import {
  downgradeQualityPreset,
  SSR_RESOLUTION_SCALE,
} from "../../utils/renderQuality";

const CAMERA_POSITION_EPSILON = 0.0001;
const CAMERA_ROTATION_EPSILON = 0.0001;
const CAMERA_PROJECTION_EPSILON = 0.000001;
const PROGRESSIVE_SETTLE_FRAMES = 24;
function matrixElementsChanged(
  previous: ArrayLike<number>,
  next: ArrayLike<number>,
  epsilon: number,
) {
  for (let index = 0; index < previous.length; index += 1) {
    if (Math.abs(previous[index] - next[index]) > epsilon) {
      return true;
    }
  }

  return false;
}

const Postprocessing = () => {
  const { gl, scene, camera } = useThree();
  const isWebGpuRenderer = Boolean(
    (gl as { isWebGPURenderer?: boolean } | null)?.isWebGPURenderer,
  );
  const [postProcessing] = useState(() =>
    isWebGpuRenderer ? new THREE.PostProcessing(gl as any) : null,
  );
  const progressiveStateRef = useRef({
    stableFrameCount: 0,
    frozenFrameId: 0,
    lastCameraPosition: new THREE.Vector3(),
    lastCameraQuaternion: new THREE.Quaternion(),
    lastProjectionElements: Array.from(camera.projectionMatrix.elements),
    initialized: false,
  });
  const bloomSettings = usePostprocessingStore((state) => state.bloom);
  const ssrSettings = usePostprocessingStore((state) => state.ssr);
  const ssgiSettings = usePostprocessingStore((state) => state.ssgi);
  const qualityPreset = usePostprocessingStore((state) => state.qualityPreset);
  const isInteracting = useViewportStore((state) => state.isInteracting);
  const interactionQualityPreset = isInteracting
    ? downgradeQualityPreset(qualityPreset)
    : qualityPreset;
  const effectiveSsrEnabled =
    ssrSettings.enabled &&
    (!isInteracting || interactionQualityPreset !== "performance");
  const effectiveSsgiEnabled =
    ssgiSettings.enabled && !isInteracting;
  const passRefs = useRef<{
    bloomPass: any;
    ssrPass: any;
    ssgiPass: any;
  } | null>(null);

  useLayoutEffect(() => {
    if (!isWebGpuRenderer || !postProcessing) {
      return;
    }

    const scenePassA = TSL.pass(scene, camera, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    scenePassA.setMRT(
      TSL.mrt({
        output: TSL.output,
        normal: TSL.directionToColor(TSL.normalView),
        metalrough: TSL.vec2(TSL.metalness, TSL.roughness),
        velocity: TSL.velocity,
      }),
    );

    const scenePassAColor = scenePassA.getTextureNode("output");
    const scenePassANormal = scenePassA.getTextureNode("normal");
    const scenePassADepth = scenePassA.getTextureNode("depth");
    const scenePassAMetalRough = scenePassA.getTextureNode("metalrough");
    const scenePassVelocity = scenePassA.getTextureNode("velocity");
    const sceneNormal = TSL.sample((uv) =>
      TSL.colorToDirection(scenePassANormal.sample(uv)),
    );

    const ssrPass = ssr(
      scenePassAColor,
      scenePassADepth,
      sceneNormal,
      scenePassAMetalRough.r,
      scenePassAMetalRough.g,
    );
    ssrPass.maxDistance.value = ssrSettings.maxDistance;
    ssrPass.blurQuality.value = ssrSettings.blurQuality;
    ssrPass.thickness.value = ssrSettings.thickness;
    ssrPass.resolutionScale = SSR_RESOLUTION_SCALE[interactionQualityPreset];

    const ssgiPass = ssgi(
      scenePassAColor,
      scenePassADepth,
      sceneNormal,
      camera as any,
    );
    ssgiPass.sliceCount.value = ssgiSettings.sliceCount;
    ssgiPass.stepCount.value = ssgiSettings.stepCount;
    ssgiPass.radius.value = ssgiSettings.radius;
    ssgiPass.giIntensity.value = ssgiSettings.giIntensity;
    ssgiPass.aoIntensity.value = ssgiSettings.aoIntensity;
    ssgiPass.thickness.value = ssgiSettings.thickness;

    const gi = ssgiPass.rgb;
    const ao = ssgiPass.a;

    const litBase = effectiveSsgiEnabled
      ? TSL.vec4(
          TSL.add(scenePassAColor.rgb.mul(ao), scenePassAColor.rgb.mul(gi)),
          scenePassAColor.a,
        )
      : scenePassAColor;

    const litComposite = effectiveSsrEnabled
      ? TSL.vec4(TSL.add(litBase.rgb, ssrPass.rgb), litBase.a)
      : litBase;

    const scenePassB = TSL.pass(scene, camera);
    scenePassB.setMRT(
      TSL.mrt({
        output: TSL.output,
        emissive: TSL.emissive,
      }),
    );

    const bloomSource = scenePassB.getTextureNode("emissive");
    const bloomPass = bloom(
      bloomSource,
      bloomSettings.strength,
      bloomSettings.radius,
      bloomSettings.threshold,
    );
    const withBloom = bloomSettings.enabled
      ? litComposite.add(bloomPass)
      : litComposite;
    const finalComposite = traa(
      withBloom,
      scenePassADepth,
      scenePassVelocity,
      camera as any,
    );

    const patchedSsgiPass = ssgiPass as any;
    const patchedTraaPass = finalComposite as any;
    const originalSsgiUpdateBefore = patchedSsgiPass.updateBefore?.bind(
      patchedSsgiPass,
    );
    const originalTraaClearViewOffset = patchedTraaPass.clearViewOffset?.bind(
      patchedTraaPass,
    );

    if (originalSsgiUpdateBefore) {
      patchedSsgiPass.updateBefore = (frame: { frameId: number }) => {
        const progressiveState = progressiveStateRef.current;
        const originalFrameId = frame.frameId;

        if (patchedSsgiPass.__progressiveFreeze) {
          frame.frameId = progressiveState.frozenFrameId;
        } else {
          progressiveState.frozenFrameId = frame.frameId;
        }

        originalSsgiUpdateBefore(frame);
        frame.frameId = originalFrameId;
      };
    }

    if (originalTraaClearViewOffset) {
      patchedTraaPass.clearViewOffset = () => {
        const jitterIndex = patchedTraaPass._jitterIndex;
        originalTraaClearViewOffset();

        if (patchedTraaPass.__progressiveFreeze) {
          patchedTraaPass._jitterIndex = jitterIndex;
        }
      };
    }

    patchedTraaPass.__progressiveSsgiPass = patchedSsgiPass;
    passRefs.current = {
      bloomPass,
      ssrPass,
      ssgiPass,
    };
    postProcessing.outputNode = finalComposite;
    postProcessing.needsUpdate = true;

    return () => {
      passRefs.current = null;
    };
  // Rebuild the node graph only when the renderer context or effect toggles change.
  // Numeric parameter updates are applied through the dedicated effect below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scene,
    camera,
    bloomSettings.enabled,
    effectiveSsrEnabled,
    effectiveSsgiEnabled,
    interactionQualityPreset,
    postProcessing,
    isWebGpuRenderer,
  ]);

  useEffect(() => {
    const passes = passRefs.current;
    if (!passes || !postProcessing) {
      return;
    }

    passes.bloomPass.strength.value = bloomSettings.strength;
    passes.bloomPass.radius.value = bloomSettings.radius;
    passes.bloomPass.threshold.value = bloomSettings.threshold;
    passes.ssrPass.maxDistance.value = ssrSettings.maxDistance;
    passes.ssrPass.blurQuality.value = ssrSettings.blurQuality;
    passes.ssrPass.thickness.value = ssrSettings.thickness;
    passes.ssrPass.resolutionScale = SSR_RESOLUTION_SCALE[interactionQualityPreset];
    passes.ssgiPass.sliceCount.value = ssgiSettings.sliceCount;
    passes.ssgiPass.stepCount.value = ssgiSettings.stepCount;
    passes.ssgiPass.radius.value = ssgiSettings.radius;
    passes.ssgiPass.giIntensity.value = ssgiSettings.giIntensity;
    passes.ssgiPass.aoIntensity.value = ssgiSettings.aoIntensity;
    passes.ssgiPass.thickness.value = ssgiSettings.thickness;
    postProcessing.needsUpdate = true;
  }, [
    bloomSettings,
    interactionQualityPreset,
    postProcessing,
    ssrSettings,
    ssgiSettings,
  ]);

  useFrame(({ gl: activeGl, scene: activeScene, camera: activeCamera }) => {
    if (!isWebGpuRenderer || !postProcessing) {
      activeGl.render(activeScene, activeCamera);
      return;
    }

    const progressiveState = progressiveStateRef.current;
    const cameraMoved =
      !progressiveState.initialized ||
      progressiveState.lastCameraPosition.distanceToSquared(
        activeCamera.position,
      ) > CAMERA_POSITION_EPSILON ||
      1 -
        Math.abs(
          progressiveState.lastCameraQuaternion.dot(activeCamera.quaternion),
        ) >
        CAMERA_ROTATION_EPSILON ||
      matrixElementsChanged(
        progressiveState.lastProjectionElements,
        activeCamera.projectionMatrix.elements,
        CAMERA_PROJECTION_EPSILON,
      );

    if (cameraMoved) {
      progressiveState.stableFrameCount = 0;
      progressiveState.initialized = true;
      progressiveState.lastCameraPosition.copy(activeCamera.position);
      progressiveState.lastCameraQuaternion.copy(activeCamera.quaternion);
      progressiveState.lastProjectionElements = Array.from(
        activeCamera.projectionMatrix.elements,
      );
    } else {
      progressiveState.stableFrameCount += 1;
    }

    const freezeProgressivePasses =
      progressiveState.stableFrameCount >= PROGRESSIVE_SETTLE_FRAMES;
    const outputNode = postProcessing.outputNode as any;

    if (outputNode) {
      outputNode.__progressiveFreeze = freezeProgressivePasses;
      if (outputNode.__progressiveSsgiPass) {
        outputNode.__progressiveSsgiPass.__progressiveFreeze =
          freezeProgressivePasses;
      }
    }

    postProcessing.render();
  }, 1);

  return null;
};

export default Postprocessing;
