import { Group, Mesh, Object3D } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

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

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader().setDecoderPath(
      "https://www.gstatic.com/draco/v3/decoders/"
    );
    const ktx2Loader = new KTX2Loader();
    loader.setDRACOLoader(dracoLoader);
    loader.setKTX2Loader(ktx2Loader);

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
          });

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
