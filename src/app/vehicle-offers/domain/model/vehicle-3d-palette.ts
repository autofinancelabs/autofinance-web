import {Model3dPreset} from './model-3d-preset';

/**
 * Suggested color swatches and defaults for a vehicle offer's 3D model. Colors are
 * free hex (the advisor can pick any), these are just curated starting points that
 * stay close to the brand palette. Labels/defaults for presets live here too.
 */

/** Body color swatches (brand teal first, then vibrant-but-flat accents + neutrals). */
export const BODY_COLOR_SWATCHES: readonly string[] = [
  '#16b1b1', // teal (brand)
  '#f0a021', // amber
  '#d93a54', // crimson
  '#2f6fed', // blue
  '#27ae60', // green
  '#9b59b6', // violet
  '#e8ecf1', // pearl white
  '#20262e', // graphite
];

/** Window tint swatches. */
export const WINDOW_COLOR_SWATCHES: readonly string[] = [
  '#1b2b33', // dark slate (default)
  '#0e0e12', // near black
  '#2b4a63', // blue tint
  '#324b3a', // green tint
];

export const DEFAULT_BODY_COLOR = '#16b1b1';
export const DEFAULT_WINDOW_COLOR = '#1b2b33';

/** Human labels for the preset buttons. */
export const MODEL_PRESET_LABEL: Record<Model3dPreset, string> = {
  [Model3dPreset.SEDAN]: 'Sedán',
  [Model3dPreset.SUV]: 'SUV',
  [Model3dPreset.PICKUP]: 'Pickup',
  [Model3dPreset.HATCHBACK]: 'Hatchback',
  [Model3dPreset.VAN]: 'Van',
  [Model3dPreset.COUPE]: 'Coupé',
  [Model3dPreset.MOTORCYCLE]: 'Moto',
};

/** Ordered presets for the picker. */
export const MODEL_PRESETS: readonly Model3dPreset[] = [
  Model3dPreset.SEDAN,
  Model3dPreset.SUV,
  Model3dPreset.PICKUP,
  Model3dPreset.HATCHBACK,
  Model3dPreset.VAN,
  Model3dPreset.COUPE,
  Model3dPreset.MOTORCYCLE,
];

/** Which cosmetic options apply to each preset (form hides the rest; builder ignores them). */
export interface PresetSupport {
  windows: boolean;
  sportWheels: boolean;
  spoiler: boolean;
  panoRoof: boolean;
  plate: boolean;
}

export const PRESET_SUPPORTS: Record<Model3dPreset, PresetSupport> = {
  [Model3dPreset.SEDAN]: {windows: true, sportWheels: true, spoiler: true, panoRoof: true, plate: true},
  [Model3dPreset.SUV]: {windows: true, sportWheels: true, spoiler: true, panoRoof: true, plate: true},
  [Model3dPreset.PICKUP]: {windows: true, sportWheels: true, spoiler: false, panoRoof: false, plate: true},
  [Model3dPreset.HATCHBACK]: {windows: true, sportWheels: true, spoiler: true, panoRoof: true, plate: true},
  [Model3dPreset.VAN]: {windows: true, sportWheels: true, spoiler: false, panoRoof: false, plate: true},
  [Model3dPreset.COUPE]: {windows: true, sportWheels: true, spoiler: true, panoRoof: true, plate: true},
  [Model3dPreset.MOTORCYCLE]: {windows: false, sportWheels: true, spoiler: false, panoRoof: false, plate: true},
};

/** A random Peruvian-style plate, e.g. "ABC-123". */
export function randomPlate(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const pick = (set: string, n: number) =>
    Array.from({length: n}, () => set[Math.floor(Math.random() * set.length)]).join('');
  return `${pick(letters, 3)}-${pick(digits, 3)}`;
}
