import { Group, Mesh, REVISION } from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;

const dracoLoader = new DRACOLoader().setDecoderPath(
  `${THREE_PATH}/examples/jsm/libs/draco/gltf/`,
);

const ktx2Loader = new KTX2Loader().setTranscoderPath(
  `${THREE_PATH}/examples/jsm/libs/basis/`,
);

let detectedRenderer: unknown = null;
let loader: GLTFLoader | null = null;

function getLoader(renderer?: unknown) {
  if (renderer && renderer !== detectedRenderer) {
    ktx2Loader.detectSupport(renderer as any);
    detectedRenderer = renderer;
    loader = null;
  }

  if (!loader) {
    loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.setCrossOrigin("anonymous");
  }

  return loader;
}

export async function loadGlbModel(
  file: File,
  renderer?: unknown,
): Promise<Group | null> {
  const url = URL.createObjectURL(file);

  try {
    if (!file.name.toLowerCase().endsWith(".glb")) {
      throw new Error("Invalid file type - must be .glb");
    }

    const buffer = await file.arrayBuffer();
    const header = new Uint8Array(buffer.slice(0, 4));
    const isGLB =
      header[0] === 0x67 &&
      header[1] === 0x6c &&
      header[2] === 0x54 &&
      header[3] === 0x46;

    if (!isGLB) {
      throw new Error("Invalid GLB file format");
    }

    const gltf = await getLoader(renderer).loadAsync(url);
    const root = gltf.scene || gltf.scenes[0];

    if (!root) {
      throw new Error("Failed to load model scene");
    }

    root.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    root.userData = {
      fileName: file.name,
      fileSize: file.size,
    };

    return root as Group;
  } catch (error) {
    console.error("Error loading GLB model:", error);
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
