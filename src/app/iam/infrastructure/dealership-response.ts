import {BaseResource} from '../../shared/infrastructure/base-response';

/**
 * Wire shapes for the dealerships endpoint, mirroring the backend resources.
 */

/** Request body for `POST /dealerships` (`RegisterDealershipResource`). */
export interface RegisterDealershipResource {
  name: string;
  ruc: string;
  contactEmail?: string;
  userEmail: string;
  username: string;
  password: string;
}

/** Response body for a registered dealership (`DealershipResource`). */
export interface DealershipResource extends BaseResource {
  name: string;
  ruc: string;
  contactEmail: string | null;
}
