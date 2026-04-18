import { REVISION, Texture, TextureLoader } from "three";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";

const THREE_ASSET_PATH = `/three/three-r${REVISION}`;

const standardTextureLoader = new TextureLoader();
const ktx2Loader = new KTX2Loader().setTranscoderPath(
  `${THREE_ASSET_PATH}/basis/`,
);

let detectedRenderer: unknown = null;

export const getTextureRequestUrl = (source: string) =>
  source.split("#")[0].split("?")[0];

export const isKtx2TextureSource = (source: string) =>
  getTextureRequestUrl(source).toLowerCase().endsWith(".ktx2") ||
  source.toLowerCase().includes(".ktx2");

export const setTextureLoaderRenderer = (renderer?: unknown) => {
  if (!renderer || renderer === detectedRenderer) {
    return;
  }

  ktx2Loader.detectSupport(renderer as any);
  detectedRenderer = renderer;
};

export const loadStudioTexture = async (
  source: string,
  renderer?: unknown,
): Promise<Texture> => {
  const requestUrl = getTextureRequestUrl(source);

  if (isKtx2TextureSource(source)) {
    setTextureLoaderRenderer(renderer);

    if (!detectedRenderer) {
      throw new Error("KTX2 texture loading requires an initialized renderer.");
    }

    return ktx2Loader.loadAsync(requestUrl);
  }

  return standardTextureLoader.loadAsync(requestUrl);
};
