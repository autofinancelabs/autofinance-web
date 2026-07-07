import {BaseResource} from '../../shared/infrastructure/base-response';

/**
 * Request body to register a client: the identity document plus optional contact
 * fields. `documentType` travels as a string (mapped to the domain enum in the
 * assembler). Contact fields are omitted when blank.
 */
export interface RegisterClientResource {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * Request body to update a client's editable data: the name (required) and the
 * contact fields (optional). The identity document is immutable, so it is never
 * part of this body (asymmetric with register).
 */
export interface UpdateClientResource {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
}

/** Response body for a client. Name/contact fields are `null` when not provided. */
export interface ClientResource extends BaseResource {
  documentType: string;
  documentNumber: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}
