import { Group, Mesh, Object3D, REVISION } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
const DRACO_LOADER = new DRACOLoader().setDecoderPath(
  `${THREE_PATH}/examples/jsm/libs/draco/gltf/`
);
const KTX2_LOADER = new KTX2Loader().setTranscoderPath(
  `${THREE_PATH}/examples/jsm/libs/basis/`
);

export async function loadGlbModel(file: File): Promise<Group | null> {
  const url = URL.createObjectURL(file);

  try {
    if (!file.name.toLowerCase().endsWith(".glb")) {
      throw new Error("Invalid file type - must be .glb");
    }

    // Verify file signature
    const buffer = await file.arrayBuffer();
    const header = new Uint8Array(buffer.slice(0, 4));
    const isGLB =
      header[0] === 0x67 &&
      header[1] === 0x6c &&
      header[2] === 0x54 &&
      header[3] === 0x46; // "glTF"

    if (!isGLB) {
      throw new Error("Invalid GLB file format");
    }

    const loader = new GLTFLoader()
      .setCrossOrigin("anonymous")
      .setDRACOLoader(DRACO_LOADER)
      .setKTX2Loader(KTX2_LOADER)
      .setMeshoptDecoder(MeshoptDecoder);

    const model = await new Promise<Object3D>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;

          model.traverse((child) => {
            if (child instanceof Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
            // if (child.name === "") {
            //   child.name = `Object_${child.id}`;
            // }
          });

          model.userData = {
            fileName: file.name,
            fileSize: file.size,
          };

          resolve(model);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });

    return model as Group;
  } catch (e) {
    console.error("Error loading GLB model:", e);
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
