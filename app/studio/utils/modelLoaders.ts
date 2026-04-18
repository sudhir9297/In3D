import { Box3, Group, Mesh, REVISION, Vector3 } from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const THREE_ASSET_PATH = `/three/three-r${REVISION}`;

const dracoLoader = new DRACOLoader().setDecoderPath(
  `${THREE_ASSET_PATH}/draco/gltf/`,
);

const ktx2Loader = new KTX2Loader().setTranscoderPath(
  `${THREE_ASSET_PATH}/basis/`,
);

let detectedRenderer: unknown = null;
let loader: GLTFLoader | null = null;
const targetImportSize = 8;
const heavyMeshVertexLimit = 150_000;

function normalizeImportedModel(root: Group) {
  root.updateMatrixWorld(true);

  const boundingBox = new Box3().setFromObject(root);
  if (boundingBox.isEmpty()) {
    return {
      importScale: 1,
      maxDimension: 0,
      vertexCount: 0,
    };
  }

  const size = boundingBox.getSize(new Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);
  const importScale =
    maxDimension > 0 ? Math.min(1, targetImportSize / maxDimension) : 1;
  let vertexCount = 0;

  if (importScale !== 1) {
    root.scale.multiplyScalar(importScale);
    root.updateMatrixWorld(true);
  }

  root.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    const meshVertexCount = child.geometry.attributes.position?.count ?? 0;
    vertexCount += meshVertexCount;
    child.frustumCulled = true;
    child.castShadow = meshVertexCount <= heavyMeshVertexLimit;
    child.receiveShadow = true;
  });

  return {
    importScale,
    maxDimension,
    vertexCount,
  };
}

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

    const metrics = normalizeImportedModel(root as Group);

    root.userData = {
      fileName: file.name,
      fileSize: file.size,
      importScale: metrics.importScale,
      maxDimension: metrics.maxDimension,
      vertexCount: metrics.vertexCount,
    };

    return root as Group;
  } catch (error) {
    console.error("Error loading GLB model:", error);
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
