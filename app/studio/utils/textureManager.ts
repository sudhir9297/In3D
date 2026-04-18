import { Texture, type Wrapping } from "three";

import type {
  MapProperties,
  TextureMapInfo,
} from "../store/materialStore";
import {
  getTextureRequestUrl,
  loadStudioTexture,
} from "./textureLoaders";

const textureAssetCache = new Map<string, Promise<Texture>>();

export const revokeBlobTextureUrl = (url?: string) => {
  const requestUrl = url ? getTextureRequestUrl(url) : undefined;
  if (requestUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(requestUrl);
  }
};

export const clearManagedTextureCache = (source?: string) => {
  if (source) {
    textureAssetCache.delete(source);
  }
};

export const createManagedTextureSource = (file: File) => {
  const objectUrl = URL.createObjectURL(file);
  return `${objectUrl}#${encodeURIComponent(file.name)}`;
};

export const loadManagedTextureAsset = (source: string) => {
  const cached = textureAssetCache.get(source);
  if (cached) {
    return cached;
  }

  const request = loadStudioTexture(source).catch((error) => {
    textureAssetCache.delete(source);
    throw error;
  });
  textureAssetCache.set(source, request);
  return request;
};

export const loadConfiguredTexture = async (
  source: string,
  mapInfo: TextureMapInfo,
  props: Pick<MapProperties, "flipY">,
  resolveWrapMode: (wrap: string) => Wrapping,
) => {
  const asset = await loadManagedTextureAsset(source);
  const texture = asset.clone();
  texture.repeat.copy(asset.repeat);
  texture.offset.copy(asset.offset);
  texture.center.copy(asset.center);
  texture.colorSpace = asset.colorSpace;
  texture.repeat.set(mapInfo.repeatX, mapInfo.repeatY);
  texture.rotation = mapInfo.rotation;
  texture.wrapS = resolveWrapMode(mapInfo.wrapS);
  texture.wrapT = resolveWrapMode(mapInfo.wrapT);
  texture.flipY = props.flipY;
  texture.needsUpdate = true;
  return texture;
};
