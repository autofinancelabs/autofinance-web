import {DocumentType} from './document-type';

/**
 * A client's identity document: its type (DNI/CE/PASAPORTE) and number. Immutable;
 * its value identifies the client within a dealership (uniqueness invariant), so it
 * cannot change once the client is registered.
 */
export class DocumentId {
  private readonly _type: DocumentType;
  private readonly _number: string;

  constructor(options: {type: DocumentType; number: string}) {
    this._type = options.type;
    this._number = options.number;
  }

  get type(): DocumentType {
    return this._type;
  }

  get number(): string {
    return this._number;
  }
}
