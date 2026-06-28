import {DocumentType} from './document-type';

/**
 * The create/edit intent for a client (the data the advisor enters). Flat fields
 * that mirror the form; the assembler maps these to the backend request bodies.
 * On edit only the contact fields are sent — the identity document is immutable.
 */
export class ClientDraft {
  private readonly _documentType: DocumentType;
  private readonly _documentNumber: string;
  private readonly _email: string | null;
  private readonly _phone: string | null;
  private readonly _address: string | null;

  constructor(options: {
    documentType: DocumentType;
    documentNumber: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  }) {
    this._documentType = options.documentType;
    this._documentNumber = options.documentNumber;
    this._email = options.email;
    this._phone = options.phone;
    this._address = options.address;
  }

  get documentType(): DocumentType {
    return this._documentType;
  }

  get documentNumber(): string {
    return this._documentNumber;
  }

  get email(): string | null {
    return this._email;
  }

  get phone(): string | null {
    return this._phone;
  }

  get address(): string | null {
    return this._address;
  }
}
