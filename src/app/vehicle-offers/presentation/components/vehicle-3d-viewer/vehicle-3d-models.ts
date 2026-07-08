import * as THREE from 'three';
import {Model3dPreset} from '../../../domain/model/model-3d-preset';
import {Vehicle3dModel} from '../../../domain/model/vehicle-3d-model';
import {PRESET_SUPPORTS} from '../../../domain/model/vehicle-3d-palette';

/**
 * Procedural low-poly (PS1/PS2-flavoured) vehicle models. Everything is built from
 * primitives with flat shading and a screen-space vertex "snap" so no binary assets
 * are shipped. Colors are free hex (body + windows); cosmetic options (sport wheels,
 * spoiler, panoramic roof, license plate) are applied when the preset supports them.
 */

const TIRE = 0x0f1216;
const HUB = 0x54606a;
const HUB_SPORT = 0xc7ced6;
const HEADLIGHT = 0xfff4c2;
const TAILLIGHT = 0xff3b52;
const TRIM = 0x2b333b;

/**
 * PS1-style vertex snapping: quantize the projected position to a coarse grid so the
 * model "wobbles" as it rotates — the classic low-precision PlayStation look.
 */
function applyPsxJitter(material: THREE.Material): void {
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
       vec2 psxGrid = vec2(130.0, 98.0);
       gl_Position.xyz /= gl_Position.w;
       gl_Position.xy = floor(gl_Position.xy * psxGrid) / psxGrid;
       gl_Position.xyz *= gl_Position.w;`,
    );
  };
}

function flatMaterial(
  color: THREE.ColorRepresentation,
  opts: {emissive?: THREE.ColorRepresentation; metalness?: number} = {},
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    metalness: opts.metalness ?? 0.22,
    roughness: 0.5,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissive ? 0.9 : 0,
  });
  applyPsxJitter(material);
  return material;
}

/** Tag emissive meshes so the viewer can animate the "lights turning on". */
export const LIGHT_TAG = 'psxLight';

function light(color: THREE.ColorRepresentation): THREE.MeshStandardMaterial {
  const m = flatMaterial(color, {emissive: color});
  m.userData[LIGHT_TAG] = true;
  return m;
}

function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

/** A low-segment wheel (tire + hub); `sport` gives a bigger, lighter, multi-spoke rim. */
function wheel(radius: number, width: number, x: number, z: number, sport: boolean): THREE.Group {
  const g = new THREE.Group();
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, sport ? 12 : 8),
    flatMaterial(TIRE, {metalness: 0.05}),
  );
  tire.rotation.z = Math.PI / 2;
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * (sport ? 0.62 : 0.42), radius * (sport ? 0.62 : 0.42), width * 1.05, sport ? 10 : 6),
    flatMaterial(sport ? HUB_SPORT : HUB, {metalness: sport ? 0.7 : 0.5}),
  );
  hub.rotation.z = Math.PI / 2;
  g.add(tire, hub);
  if (sport) {
    // simple spokes: a couple of thin crossbars on the outward face
    const spoke = flatMaterial(HUB_SPORT, {metalness: 0.7});
    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, radius * 1.3, radius * 0.12), spoke);
      bar.rotation.x = (i * Math.PI) / 3;
      g.add(bar);
    }
  }
  g.position.set(x, radius, z);
  return g;
}

/** A license plate as an unlit CanvasTexture on a thin plane; caller positions/rotates it. */
function makePlate(text: string): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#e9e564';
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = '#141414';
  ctx.fillRect(3, 3, 122, 58);
  ctx.fillStyle = '#e9e564';
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((text || '').slice(0, 8).toUpperCase(), 64, 34);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.31),
    new THREE.MeshBasicMaterial({map: texture}),
  );
  return mesh;
}

interface PlateAnchor {
  y: number;
  frontZ: number | null;
  rearZ: number;
}

interface Spec {
  width: number;
  wheelRadius: number;
  wheelWidth: number;
  axleFront: number;
  axleRear: number;
  motorcycle?: boolean;
  plate: PlateAnchor;
  build: (model: Vehicle3dModel) => THREE.Object3D[];
}

function spoilerFor(bodyColor: THREE.ColorRepresentation, y: number, z: number, w: number): THREE.Object3D[] {
  const mat = flatMaterial(bodyColor);
  return [
    box(w, 0.06, 0.34, mat, 0, y + 0.28, z),
    box(0.1, 0.28, 0.1, mat, -w * 0.38, y + 0.14, z),
    box(0.1, 0.28, 0.1, mat, w * 0.38, y + 0.14, z),
  ];
}

function sedan(): Spec {
  const W = 1.8;
  return {
    width: W,
    wheelRadius: 0.42,
    wheelWidth: 0.28,
    axleFront: 1.42,
    axleRear: -1.42,
    plate: {y: 0.7, frontZ: 2.13, rearZ: -2.13},
    build: model => {
      const body = flatMaterial(model.bodyColor);
      const glass = flatMaterial(model.windowColor, {metalness: 0.1});
      const parts: THREE.Object3D[] = [];
      parts.push(box(W, 0.62, 4.2, body, 0, 0.74, 0));
      parts.push(box(W * 0.96, 0.16, 4.24, flatMaterial(model.bodyColor), 0, 1.03, 0));
      parts.push(box(W * 0.88, 0.52, 2.0, body, 0, 1.32, -0.1));
      parts.push(box(W * 0.9, 0.34, 1.7, glass, 0, 1.33, -0.1));
      if (model.panoRoof) {
        parts.push(box(W * 0.7, 0.06, 1.2, flatMaterial(model.windowColor), 0, 1.585, -0.1));
      }
      parts.push(box(0.34, 0.16, 0.06, light(HEADLIGHT), -0.62, 0.82, 2.11));
      parts.push(box(0.34, 0.16, 0.06, light(HEADLIGHT), 0.62, 0.82, 2.11));
      parts.push(box(0.36, 0.16, 0.06, light(TAILLIGHT), -0.6, 0.86, -2.11));
      parts.push(box(0.36, 0.16, 0.06, light(TAILLIGHT), 0.6, 0.86, -2.11));
      if (model.spoiler) {
        parts.push(...spoilerFor(model.bodyColor, 0.9, -2.0, W * 0.9));
      }
      return parts;
    },
  };
}

function suv(): Spec {
  const W = 1.92;
  return {
    width: W,
    wheelRadius: 0.5,
    wheelWidth: 0.32,
    axleFront: 1.5,
    axleRear: -1.5,
    plate: {y: 0.9, frontZ: 2.2, rearZ: -2.2},
    build: model => {
      const body = flatMaterial(model.bodyColor);
      const glass = flatMaterial(model.windowColor, {metalness: 0.1});
      const parts: THREE.Object3D[] = [];
      parts.push(box(W, 0.9, 4.35, body, 0, 1.02, 0));
      parts.push(box(W * 0.94, 0.72, 2.9, body, 0, 1.74, -0.2));
      parts.push(box(W * 0.96, 0.44, 2.55, glass, 0, 1.78, -0.2));
      if (model.panoRoof) {
        parts.push(box(W * 0.72, 0.06, 1.7, flatMaterial(model.windowColor), 0, 2.09, -0.2));
      } else {
        parts.push(box(0.08, 0.06, 2.6, flatMaterial(TRIM), -W * 0.4, 2.12, -0.2));
        parts.push(box(0.08, 0.06, 2.6, flatMaterial(TRIM), W * 0.4, 2.12, -0.2));
      }
      parts.push(box(0.4, 0.2, 0.06, light(HEADLIGHT), -0.64, 1.02, 2.18));
      parts.push(box(0.4, 0.2, 0.06, light(HEADLIGHT), 0.64, 1.02, 2.18));
      parts.push(box(0.42, 0.3, 0.06, light(TAILLIGHT), -0.62, 1.12, -2.18));
      parts.push(box(0.42, 0.3, 0.06, light(TAILLIGHT), 0.62, 1.12, -2.18));
      if (model.spoiler) {
        parts.push(...spoilerFor(model.bodyColor, 1.9, -2.05, W * 0.9));
      }
      return parts;
    },
  };
}

function pickup(): Spec {
  const W = 1.9;
  return {
    width: W,
    wheelRadius: 0.5,
    wheelWidth: 0.34,
    axleFront: 1.55,
    axleRear: -1.65,
    plate: {y: 0.78, frontZ: 2.47, rearZ: -2.47},
    build: model => {
      const body = flatMaterial(model.bodyColor);
      const glass = flatMaterial(model.windowColor, {metalness: 0.1});
      const parts: THREE.Object3D[] = [];
      parts.push(box(W, 0.6, 4.9, body, 0, 0.86, 0));
      parts.push(box(W * 0.92, 0.72, 1.7, body, 0, 1.5, 1.15));
      parts.push(box(W * 0.94, 0.44, 1.4, glass, 0, 1.54, 1.15));
      parts.push(box(0.12, 0.5, 2.4, body, -W * 0.44, 1.32, -1.05));
      parts.push(box(0.12, 0.5, 2.4, body, W * 0.44, 1.32, -1.05));
      parts.push(box(W * 0.9, 0.5, 0.12, body, 0, 1.32, -2.2));
      parts.push(box(W * 0.9, 0.5, 0.12, body, 0, 1.32, 0.12));
      parts.push(box(0.4, 0.2, 0.06, light(HEADLIGHT), -0.64, 0.9, 2.46));
      parts.push(box(0.4, 0.2, 0.06, light(HEADLIGHT), 0.64, 0.9, 2.46));
      parts.push(box(0.4, 0.18, 0.06, light(TAILLIGHT), -0.6, 0.9, -2.46));
      parts.push(box(0.4, 0.18, 0.06, light(TAILLIGHT), 0.6, 0.9, -2.46));
      return parts;
    },
  };
}

function hatchback(): Spec {
  const W = 1.76;
  return {
    width: W,
    wheelRadius: 0.4,
    wheelWidth: 0.26,
    axleFront: 1.15,
    axleRear: -1.15,
    plate: {y: 0.66, frontZ: 1.66, rearZ: -1.66},
    build: model => {
      const body = flatMaterial(model.bodyColor);
      const glass = flatMaterial(model.windowColor, {metalness: 0.1});
      const parts: THREE.Object3D[] = [];
      // short, tall-ish two-box body (cabin flows into a stubby tail)
      parts.push(box(W, 0.66, 3.3, body, 0, 0.72, 0));
      parts.push(box(W * 0.9, 0.6, 1.9, body, 0, 1.28, -0.15));
      parts.push(box(W * 0.92, 0.4, 1.6, glass, 0, 1.3, -0.15));
      // steep hatch rear
      parts.push(box(W * 0.9, 0.5, 0.14, body, 0, 1.1, -1.55));
      if (model.panoRoof) {
        parts.push(box(W * 0.7, 0.06, 1.0, flatMaterial(model.windowColor), 0, 1.555, -0.15));
      }
      parts.push(box(0.3, 0.16, 0.06, light(HEADLIGHT), -0.58, 0.8, 1.66));
      parts.push(box(0.3, 0.16, 0.06, light(HEADLIGHT), 0.58, 0.8, 1.66));
      parts.push(box(0.32, 0.22, 0.06, light(TAILLIGHT), -0.56, 0.95, -1.62));
      parts.push(box(0.32, 0.22, 0.06, light(TAILLIGHT), 0.56, 0.95, -1.62));
      if (model.spoiler) {
        parts.push(...spoilerFor(model.bodyColor, 1.35, -1.5, W * 0.85));
      }
      return parts;
    },
  };
}

function van(): Spec {
  const W = 1.98;
  return {
    width: W,
    wheelRadius: 0.46,
    wheelWidth: 0.3,
    axleFront: 1.55,
    axleRear: -1.6,
    plate: {y: 0.82, frontZ: 2.36, rearZ: -2.36},
    build: model => {
      const body = flatMaterial(model.bodyColor);
      const glass = flatMaterial(model.windowColor, {metalness: 0.1});
      const parts: THREE.Object3D[] = [];
      // one tall boxy volume with a short sloped nose
      parts.push(box(W, 1.5, 4.6, body, 0, 1.3, -0.1));
      parts.push(box(W, 0.7, 0.7, body, 0, 0.75, 2.3)); // stubby hood
      // windshield + long side glass band
      parts.push(box(W * 0.96, 0.5, 0.16, glass, 0, 1.65, 2.02));
      parts.push(box(W * 1.005, 0.42, 2.6, glass, 0, 1.66, 0.2));
      if (model.panoRoof) {
        parts.push(box(W * 0.72, 0.06, 2.0, flatMaterial(model.windowColor), 0, 2.06, -0.1));
      }
      parts.push(box(0.4, 0.2, 0.06, light(HEADLIGHT), -0.66, 0.72, 2.66));
      parts.push(box(0.4, 0.2, 0.06, light(HEADLIGHT), 0.66, 0.72, 2.66));
      parts.push(box(0.34, 0.5, 0.06, light(TAILLIGHT), -0.78, 1.2, -2.41));
      parts.push(box(0.34, 0.5, 0.06, light(TAILLIGHT), 0.78, 1.2, -2.41));
      return parts;
    },
  };
}

function coupe(): Spec {
  const W = 1.84;
  return {
    width: W,
    wheelRadius: 0.44,
    wheelWidth: 0.32,
    axleFront: 1.5,
    axleRear: -1.5,
    plate: {y: 0.6, frontZ: 2.13, rearZ: -2.13},
    build: model => {
      const body = flatMaterial(model.bodyColor, {metalness: 0.4});
      const glass = flatMaterial(model.windowColor, {metalness: 0.15});
      const parts: THREE.Object3D[] = [];
      // low, sleek: long hood, fastback cabin
      parts.push(box(W, 0.5, 4.3, body, 0, 0.6, 0));
      parts.push(box(W * 0.94, 0.14, 4.34, flatMaterial(model.bodyColor, {metalness: 0.4}), 0, 0.84, 0));
      // fastback greenhouse (shifted rearward, lower)
      parts.push(box(W * 0.84, 0.42, 1.7, body, 0, 1.06, -0.35));
      parts.push(box(W * 0.86, 0.3, 1.5, glass, 0, 1.08, -0.3));
      if (model.panoRoof) {
        parts.push(box(W * 0.66, 0.05, 0.95, flatMaterial(model.windowColor), 0, 1.28, -0.35));
      }
      parts.push(box(0.36, 0.12, 0.06, light(HEADLIGHT), -0.6, 0.66, 2.13));
      parts.push(box(0.36, 0.12, 0.06, light(HEADLIGHT), 0.6, 0.66, 2.13));
      parts.push(box(W * 0.9, 0.1, 0.06, light(TAILLIGHT), 0, 0.72, -2.13));
      if (model.spoiler) {
        parts.push(...spoilerFor(model.bodyColor, 0.72, -1.95, W * 0.9));
      }
      return parts;
    },
  };
}

function motorcycle(): Spec {
  const W = 0.3;
  return {
    width: W,
    wheelRadius: 0.56,
    wheelWidth: 0.16,
    axleFront: 1.05,
    axleRear: -1.05,
    motorcycle: true,
    plate: {y: 0.55, frontZ: null, rearZ: -1.5},
    build: model => {
      const body = flatMaterial(model.bodyColor, {metalness: 0.5});
      const dark = flatMaterial(0x1a1d22, {metalness: 0.4});
      const parts: THREE.Object3D[] = [];
      // fuel tank + seat unit along the spine
      parts.push(box(0.42, 0.34, 1.0, body, 0, 0.95, 0.25));
      parts.push(box(0.36, 0.18, 0.9, dark, 0, 0.92, -0.6)); // seat
      // engine block
      parts.push(box(0.5, 0.44, 0.6, dark, 0, 0.62, 0.1));
      // front fork + handlebar
      parts.push(box(0.08, 0.9, 0.08, dark, 0, 0.85, 1.02));
      parts.push(box(0.62, 0.08, 0.08, dark, 0, 1.24, 1.02));
      // headlight + taillight
      parts.push(box(0.22, 0.22, 0.1, light(HEADLIGHT), 0, 1.02, 1.16));
      parts.push(box(0.2, 0.12, 0.06, light(TAILLIGHT), 0, 0.85, -1.45));
      // rear hugger / fender to mount the plate
      parts.push(box(0.3, 0.36, 0.08, dark, 0, 0.62, -1.46));
      return parts;
    },
  };
}

const SPECS: Record<Model3dPreset, () => Spec> = {
  [Model3dPreset.SEDAN]: sedan,
  [Model3dPreset.SUV]: suv,
  [Model3dPreset.PICKUP]: pickup,
  [Model3dPreset.HATCHBACK]: hatchback,
  [Model3dPreset.VAN]: van,
  [Model3dPreset.COUPE]: coupe,
  [Model3dPreset.MOTORCYCLE]: motorcycle,
};

/**
 * Builds a fresh, centered {@link THREE.Group} for the given 3D model config. Caller
 * owns disposal via {@link disposeVehicle}.
 */
export function buildVehicle(model: Vehicle3dModel): THREE.Group {
  const spec = SPECS[model.preset]();
  const group = new THREE.Group();

  for (const part of spec.build(model)) {
    group.add(part);
  }

  const sport = model.sportWheels && PRESET_SUPPORTS[model.preset].sportWheels;
  if (spec.motorcycle) {
    group.add(wheel(spec.wheelRadius, spec.wheelWidth, 0, spec.axleFront, sport));
    group.add(wheel(spec.wheelRadius, spec.wheelWidth, 0, spec.axleRear, sport));
  } else {
    group.add(wheel(spec.wheelRadius, spec.wheelWidth, spec.width / 2, spec.axleFront, sport));
    group.add(wheel(spec.wheelRadius, spec.wheelWidth, -spec.width / 2, spec.axleFront, sport));
    group.add(wheel(spec.wheelRadius, spec.wheelWidth, spec.width / 2, spec.axleRear, sport));
    group.add(wheel(spec.wheelRadius, spec.wheelWidth, -spec.width / 2, spec.axleRear, sport));
  }

  if (model.plateText && PRESET_SUPPORTS[model.preset].plate) {
    const rear = makePlate(model.plateText);
    rear.position.set(0, spec.plate.y, spec.plate.rearZ - 0.02);
    rear.rotation.y = Math.PI;
    group.add(rear);
    if (spec.plate.frontZ !== null) {
      const front = makePlate(model.plateText);
      front.position.set(0, spec.plate.y, spec.plate.frontZ + 0.02);
      group.add(front);
    }
  }

  // Center vertically around the model's mid-height so it orbits nicely.
  const bbox = new THREE.Box3().setFromObject(group);
  const center = bbox.getCenter(new THREE.Vector3());
  group.position.y = -center.y;

  return group;
}

/** Disposes every geometry/material (and plate texture) under an object built here. */
export function disposeVehicle(object: THREE.Object3D): void {
  object.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const material = child.material;
      const materials = Array.isArray(material) ? material : [material];
      for (const m of materials) {
        const mapped = m as THREE.MeshBasicMaterial;
        if (mapped.map) {
          mapped.map.dispose();
        }
        m.dispose();
      }
    }
  });
}
