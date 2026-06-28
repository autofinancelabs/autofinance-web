import {BaseResource} from '../../shared/infrastructure/base-response';
import {MoneyResource} from '../../shared/infrastructure/money-response';

/**
 * Request body for creating/updating a vehicle offer. `salePrice` is a flat
 * number + `currency` string (asymmetric with the response, which nests them).
 * `planName`/`planInstallments` are sent together or omitted together.
 */
export interface RegisterVehicleOfferResource {
  make: string;
  model: string;
  year: number;
  salePrice: number;
  currency: string;
  planName?: string;
  planInstallments?: number;
}

/** Response body for a vehicle offer (`salePrice` nested as MoneyResource). */
export interface VehicleOfferResource extends BaseResource {
  make: string;
  model: string;
  year: number;
  salePrice: MoneyResource;
  planName: string | null;
  planInstallments: number | null;
}
