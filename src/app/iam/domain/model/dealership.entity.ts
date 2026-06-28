import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * A dealership account (tenant), as returned by registration.
 *
 * Note this entity does NOT carry the account-creation credentials
 * (user email/username/password) — those live only in the
 * {@link DealershipRegistration} command.
 */
export class Dealership implements BaseEntity {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _ruc: string;
  private readonly _contactEmail: string | null;

  constructor(options: {id: string; name: string; ruc: string; contactEmail: string | null}) {
    this._id = options.id;
    this._name = options.name;
    this._ruc = options.ruc;
    this._contactEmail = options.contactEmail;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  /** Peruvian tax id (RUC), 11 digits. */
  get ruc(): string {
    return this._ruc;
  }

  get contactEmail(): string | null {
    return this._contactEmail;
  }
}
