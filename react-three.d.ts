/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { ThreeToJSXElements } from "@react-three/fiber";
import type * as THREE from "three/webgpu";

declare module "@react-three/fiber" {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

declare module "three/examples/jsm/tsl/display/SSRNode.js" {
  export const ssr: (...args: any[]) => any;
}

declare module "three/examples/jsm/tsl/display/SSGINode.js" {
  export const ssgi: (...args: any[]) => any;
}

declare module "three/examples/jsm/tsl/display/BloomNode.js" {
  export const bloom: (...args: any[]) => any;
}

declare module "three/examples/jsm/tsl/display/TRAANode.js" {
  export const traa: (...args: any[]) => any;
}

export {};
