/**
 * The low-poly 3D model shapes a vehicle offer can be represented with. Optional:
 * an offer may have no 3D model. Mirrors the backend `Model3dPreset` enum.
 */
export const Model3dPreset = {
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  PICKUP: 'PICKUP',
  HATCHBACK: 'HATCHBACK',
  VAN: 'VAN',
  COUPE: 'COUPE',
  MOTORCYCLE: 'MOTORCYCLE',
} as const;

export type Model3dPreset = (typeof Model3dPreset)[keyof typeof Model3dPreset];
