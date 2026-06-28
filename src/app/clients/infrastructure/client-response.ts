import {BaseResource} from '../../shared/infrastructure/base-response';

/**
 * Request body to register a client: the identity document plus optional contact
 * fields. `documentType` travels as a string (mapped to the domain enum in the
 * assembler). Contact fields are omitted when blank.
 */
export interface RegisterClientResource {
  documentType: string;
  documentNumber: string;
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * Request body to update a client's contact data. The identity document is
 * immutable, so it is never part of this body (asymmetric with register).
 */
export interface UpdateClientResource {
  email?: string;
  phone?: string;
  address?: string;
}

/** Response body for a client. Contact fields are `null` when not provided. */
export interface ClientResource extends BaseResource {
  documentType: string;
  documentNumber: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}
