import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {ContactInfo} from './contact-info.value-object';
import {DocumentId} from './document-id.value-object';
import {PersonName} from './person-name.value-object';

/**
 * A client (the debtor / cliente that the Credit Simulation core references by-id).
 * Identified by an immutable `DocumentId`; the name and contact data are editable.
 * `name` is `null` for legacy clients registered before names existed.
 * Scoped to the dealership (tenant) server-side; the frontend references it by `id`.
 */
export class Client implements BaseEntity {
  private readonly _id: string;
  private readonly _documentId: DocumentId;
  private readonly _name: PersonName | null;
  private readonly _contactInfo: ContactInfo | null;

  constructor(options: {
    id: string;
    documentId: DocumentId;
    name: PersonName | null;
    contactInfo: ContactInfo | null;
  }) {
    this._id = options.id;
    this._documentId = options.documentId;
    this._name = options.name;
    this._contactInfo = options.contactInfo;
  }

  get id(): string {
    return this._id;
  }

  get documentId(): DocumentId {
    return this._documentId;
  }

  get name(): PersonName | null {
    return this._name;
  }

  get contactInfo(): ContactInfo | null {
    return this._contactInfo;
  }

  /**
   * Human-friendly label: the short name ("Juan Pérez") when present, falling back
   * to the document ("DNI 12345678") for legacy clients without a name.
   */
  get displayName(): string {
    return this._name?.shortName ?? `${this._documentId.type} ${this._documentId.number}`;
  }
}
