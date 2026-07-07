/**
 * The sign-in intent: the credentials a sales advisor submits to authenticate.
 *
 * `identifier` is either the username or the email (the backend accepts both).
 */
export class Credentials {
  private readonly _identifier: string;
  private readonly _password: string;

  constructor(options: {identifier: string; password: string}) {
    this._identifier = options.identifier;
    this._password = options.password;
  }

  get identifier(): string {
    return this._identifier;
  }

  get password(): string {
    return this._password;
  }
}
