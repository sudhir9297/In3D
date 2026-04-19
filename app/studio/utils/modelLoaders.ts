import { Box3, Group, LoadingManager, Mesh, REVISION, Vector3 } from "three";
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
const targetImportSize = 8;
const heavyMeshVertexLimit = 150_000;

type AssetFileMap = Map<string, File>;

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

const normalizeAssetKey = (value: string) =>
  decodeURIComponent(value.split(/[?#]/, 1)[0] ?? "")
    .replace(/^(\.\/)+/, "")
    .replace(/^\/+/, "")
    .toLowerCase();

const getAssetCandidates = (value: string) => {
  const normalized = normalizeAssetKey(value);
  const fileName = normalized.split("/").pop() ?? normalized;

  return Array.from(new Set([normalized, fileName]));
};

const createAssetFileMap = (files: File[]) => {
  const assetFiles: AssetFileMap = new Map();

  files.forEach((file) => {
    const normalizedName = normalizeAssetKey(file.name);
    assetFiles.set(normalizedName, file);

    const fileName = normalizedName.split("/").pop();
    if (fileName) {
      assetFiles.set(fileName, file);
    }
  });

  return assetFiles;
};

function createLoader(renderer?: unknown, assetFiles?: AssetFileMap) {
  if (renderer && renderer !== detectedRenderer) {
    ktx2Loader.detectSupport(renderer as any);
    detectedRenderer = renderer;
  }

  const objectUrlCache = new Map<File, string>();
  const manager = new LoadingManager();
  manager.setURLModifier((url) => {
    if (!assetFiles) {
      return url;
    }

    const assetFile = getAssetCandidates(url)
      .map((candidate) => assetFiles.get(candidate))
      .find(Boolean);

    if (!assetFile) {
      return url;
    }

    const cachedUrl = objectUrlCache.get(assetFile);
    if (cachedUrl) {
      return cachedUrl;
    }

    const objectUrl = URL.createObjectURL(assetFile);
    objectUrlCache.set(assetFile, objectUrl);
    return objectUrl;
  });

  const loader = new GLTFLoader(manager);
  loader.setDRACOLoader(dracoLoader);
  loader.setKTX2Loader(ktx2Loader);
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.setCrossOrigin("anonymous");

  const revokeObjectUrls = () => {
    objectUrlCache.forEach((url) => URL.revokeObjectURL(url));
    objectUrlCache.clear();
  };

  return {
    loader,
    revokeObjectUrls,
  };
}

const isGlbFile = (file: File) => file.name.toLowerCase().endsWith(".glb");

const isGltfFile = (file: File) => file.name.toLowerCase().endsWith(".gltf");

const isModelFile = (file: File) => isGlbFile(file) || isGltfFile(file);

async function parseModelFile(
  file: File,
  loader: GLTFLoader,
): Promise<Group | null> {
  if (isGlbFile(file)) {
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

    const gltf = await loader.parseAsync(buffer, "");
    return (gltf.scene || gltf.scenes[0] || null) as Group | null;
  }

  if (isGltfFile(file)) {
    const source = await file.text();
    const gltf = await loader.parseAsync(source, "");
    return (gltf.scene || gltf.scenes[0] || null) as Group | null;
  }

  throw new Error("Invalid file type - must be .glb or .gltf");
}

export async function loadModelFile(
  file: File,
  renderer?: unknown,
  assetFiles?: AssetFileMap,
): Promise<Group | null> {
  const { loader, revokeObjectUrls } = createLoader(renderer, assetFiles);

  try {
    const root = await parseModelFile(file, loader);

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
    console.error(`Error loading model "${file.name}":`, error);
    return null;
  } finally {
    revokeObjectUrls();
  }
}

export async function loadModelFiles(
  files: File[],
  renderer?: unknown,
): Promise<Group[]> {
  const assetFiles = createAssetFileMap(files);
  const modelFiles = files.filter(isModelFile);

  const loadedModels = await Promise.all(
    modelFiles.map((file) => loadModelFile(file, renderer, assetFiles)),
  );

  return loadedModels.filter((model): model is Group => Boolean(model));
}

export async function loadGlbModel(
  file: File,
  renderer?: unknown,
): Promise<Group | null> {
  if (!isModelFile(file)) {
    console.error(`Unsupported model file "${file.name}"`);
    return null;
  }

  return loadModelFile(file, renderer);
}
