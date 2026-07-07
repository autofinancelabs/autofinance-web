/**
 * A client's optional contact data: email, phone and address. All optional in v1;
 * absent data is modelled as `null` (a field, or the whole value object). Use the
 * static {@link ContactInfo.of} factory to build it from raw inputs — it returns
 * `null` when nothing was provided, mirroring the backend's `ContactInfo.of`.
 */
export class ContactInfo {
  private readonly _email: string | null;
  private readonly _phone: string | null;
  private readonly _address: string | null;

  constructor(options: {email: string | null; phone: string | null; address: string | null}) {
    this._email = options.email;
    this._phone = options.phone;
    this._address = options.address;
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

  /** True when at least one contact field is present. */
  get hasAny(): boolean {
    return this._email !== null || this._phone !== null || this._address !== null;
  }

  /**
   * Builds contact info from optional, possibly blank inputs. Blank strings become
   * `null`; when none is provided the whole value object is `null`.
   */
  static of(
    email: string | null | undefined,
    phone: string | null | undefined,
    address: string | null | undefined,
  ): ContactInfo | null {
    const normalizedEmail = ContactInfo.normalize(email);
    const normalizedPhone = ContactInfo.normalize(phone);
    const normalizedAddress = ContactInfo.normalize(address);
    if (normalizedEmail === null && normalizedPhone === null && normalizedAddress === null) {
      return null;
    }
    return new ContactInfo({
      email: normalizedEmail,
      phone: normalizedPhone,
      address: normalizedAddress,
    });
  }

  private static normalize(value: string | null | undefined): string | null {
    if (value === null || value === undefined || value.trim() === '') {
      return null;
    }
    return value.trim();
  }
}
