import {BaseResource} from '../../shared/infrastructure/base-response';
import {MoneyResource} from '../../shared/infrastructure/money-response';

/** Wire shape of the optional 3D model (nested object, `null` when none). */
export interface Model3dResource {
  preset: string;
  bodyColor: string;
  windowColor: string | null;
  sportWheels: boolean | null;
  spoiler: boolean | null;
  panoRoof: boolean | null;
  plateText: string | null;
}

/**
 * Request body for creating/updating a vehicle offer. `salePrice` is a flat
 * number + `currency` string (asymmetric with the response, which nests them).
 * `model3d` is `null` when no 3D model was generated.
 */
export interface RegisterVehicleOfferResource {
  make: string;
  model: string;
  year: number;
  salePrice: number;
  currency: string;
  model3d: Model3dResource | null;
}

/** Response body for a vehicle offer (`salePrice` nested as MoneyResource). */
export interface VehicleOfferResource extends BaseResource {
  make: string;
  model: string;
  year: number;
  salePrice: MoneyResource;
  model3d: Model3dResource | null;
}
