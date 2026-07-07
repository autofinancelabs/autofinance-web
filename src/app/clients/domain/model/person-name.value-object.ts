/**
 * A client's personal name: given names (`firstName`, e.g. "Juan Carlos") and
 * family names (`lastName`, e.g. "Pérez García"), each stored whole. Mirrors the
 * backend `PersonName`. Unlike the document it is not part of the identity, so it
 * can change. Use {@link PersonName.of} to build it from raw inputs (returns
 * `null` when either part is blank — legacy clients have no name).
 */
export class PersonName {
  private readonly _firstName: string;
  private readonly _lastName: string;

  constructor(options: {firstName: string; lastName: string}) {
    this._firstName = options.firstName;
    this._lastName = options.lastName;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  /** The first given name plus the first family name, e.g. "Juan Pérez". */
  get shortName(): string {
    const first = this._firstName.trim().split(/\s+/)[0] ?? '';
    const last = this._lastName.trim().split(/\s+/)[0] ?? '';
    return `${first} ${last}`.trim();
  }

  /** Builds a name from possibly-blank inputs; returns `null` unless both parts are present. */
  static of(
    firstName: string | null | undefined,
    lastName: string | null | undefined,
  ): PersonName | null {
    const first = firstName?.trim() ?? '';
    const last = lastName?.trim() ?? '';
    if (first === '' || last === '') {
      return null;
    }
    return new PersonName({firstName: first, lastName: last});
  }
}
