import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {ContactInfo} from './contact-info.value-object';
import {DocumentId} from './document-id.value-object';

/**
 * A client (the debtor / cliente that the Credit Simulation core references by-id).
 * Identified by an immutable `DocumentId`; contact data is optional and editable.
 * Scoped to the dealership (tenant) server-side; the frontend references it by `id`.
 */
export class Client implements BaseEntity {
  private readonly _id: string;
  private readonly _documentId: DocumentId;
  private readonly _contactInfo: ContactInfo | null;

  constructor(options: {id: string; documentId: DocumentId; contactInfo: ContactInfo | null}) {
    this._id = options.id;
    this._documentId = options.documentId;
    this._contactInfo = options.contactInfo;
  }

  get id(): string {
    return this._id;
  }

  get documentId(): DocumentId {
    return this._documentId;
  }

  get contactInfo(): ContactInfo | null {
    return this._contactInfo;
  }
}
