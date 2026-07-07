/**
 * The register-dealership intent: creates the dealership account plus its first
 * user in a single operation. `contactEmail` is optional; the remaining fields
 * are required by the backend (the RUC must be 11 digits).
 */
export class DealershipRegistration {
  private readonly _name: string;
  private readonly _ruc: string;
  private readonly _contactEmail: string | null;
  private readonly _userEmail: string;
  private readonly _username: string;
  private readonly _password: string;

  constructor(options: {
    name: string;
    ruc: string;
    contactEmail: string | null;
    userEmail: string;
    username: string;
    password: string;
  }) {
    this._name = options.name;
    this._ruc = options.ruc;
    this._contactEmail = options.contactEmail;
    this._userEmail = options.userEmail;
    this._username = options.username;
    this._password = options.password;
  }

  get name(): string {
    return this._name;
  }

  get ruc(): string {
    return this._ruc;
  }

  get contactEmail(): string | null {
    return this._contactEmail;
  }

  get userEmail(): string {
    return this._userEmail;
  }

  get username(): string {
    return this._username;
  }

  get password(): string {
    return this._password;
  }
}
