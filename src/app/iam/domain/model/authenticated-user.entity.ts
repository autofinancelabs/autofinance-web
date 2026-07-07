import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * The authenticated session principal (the result of a successful sign-in).
 *
 * `id` is the backend `userId`. `dealershipId` is the tenant the user belongs
 * to; `token` is the JWT carrying both as claims.
 */
export class AuthenticatedUser implements BaseEntity {
  private readonly _id: string;
  private readonly _username: string;
  private readonly _dealershipId: string;
  private readonly _token: string;

  constructor(options: {id: string; username: string; dealershipId: string; token: string}) {
    this._id = options.id;
    this._username = options.username;
    this._dealershipId = options.dealershipId;
    this._token = options.token;
  }

  /** The user's unique identifier (backend `userId`). */
  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  /** The tenant (dealership) this user operates under. */
  get dealershipId(): string {
    return this._dealershipId;
  }

  /** The JWT bearer token for authenticated requests. */
  get token(): string {
    return this._token;
  }
}
