import {Model3dPreset} from './model-3d-preset';

/**
 * The optional low-poly 3D model of a vehicle offer: its silhouette, body/window
 * colors (free hex) and cosmetic options. Mirrors the backend `Vehicle3dModel` VO.
 * The whole object is `null` on a `VehicleOffer` when no 3D model was generated.
 */
export interface Vehicle3dModel {
  preset: Model3dPreset;
  bodyColor: string;
  windowColor: string;
  sportWheels: boolean;
  spoiler: boolean;
  panoRoof: boolean;
  plateText: string;
}
