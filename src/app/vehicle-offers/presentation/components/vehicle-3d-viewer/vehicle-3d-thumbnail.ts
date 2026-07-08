import * as THREE from 'three';
import {Vehicle3dModel} from '../../../domain/model/vehicle-3d-model';
import {buildVehicle, disposeVehicle} from './vehicle-3d-models';

/**
 * Renders a static PNG thumbnail of a low-poly vehicle. A single offscreen WebGL
 * renderer is reused across calls (created lazily) and results are cached by config,
 * so a list with many rows stays cheap. This module statically imports three, so
 * consumers should load it with a dynamic `import()` to keep three out of their
 * bundle chunk. Returns a data URL, or `null` when WebGL is unavailable.
 */

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let unavailable = false;
const cache = new Map<string, string>();

function ensureRenderer(size: number): boolean {
  if (unavailable) {
    return false;
  }
  if (renderer) {
    renderer.setSize(size, size, false);
    camera!.aspect = 1;
    camera!.updateProjectionMatrix();
    return true;
  }
  try {
    renderer = new THREE.WebGLRenderer({antialias: false, alpha: true, preserveDrawingBuffer: true});
    renderer.setPixelRatio(1);
    renderer.setSize(size, size, false);
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(5.6, 3.4, 6.8);
    camera.lookAt(0, 0.1, 0);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(5, 8, 6);
    const rim = new THREE.DirectionalLight(0x38d6d6, 0.5);
    rim.position.set(-6, 3, -5);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x24303a, 0.9);
    scene.add(key, rim, hemi);
    return true;
  } catch {
    unavailable = true;
    renderer = null;
    return false;
  }
}

/** Renders (or returns a cached) PNG data URL for the given 3D model, or null. */
export function renderVehicleThumbnail(model: Vehicle3dModel, size = 128): string | null {
  const cacheKey = `${size}|${JSON.stringify(model)}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }
  if (!ensureRenderer(size)) {
    return null;
  }

  const car = buildVehicle(model);
  car.rotation.y = -0.6; // fixed three-quarter angle
  scene!.add(car);
  renderer!.render(scene!, camera!);
  const url = renderer!.domElement.toDataURL('image/png');
  scene!.remove(car);
  disposeVehicle(car);

  cache.set(cacheKey, url);
  return url;
}
