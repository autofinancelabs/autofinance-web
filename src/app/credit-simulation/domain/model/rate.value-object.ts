import {RateType} from './rate-type';

/**
 * An interest rate: its value (a fraction, e.g. 0.15 = 15%), its type
 * (nominal/effective) and, for nominal rates, the capitalization frequency in
 * days (e.g. 1=daily, 30=monthly, 360=annual). Immutable. Used both for the
 * financing rate and for the cost of capital (COK).
 */
export class Rate {
  private readonly _value: number;
  private readonly _type: RateType;
  private readonly _capitalization: number | null;

  constructor(options: {value: number; type: RateType; capitalization: number | null}) {
    this._value = options.value;
    this._type = options.type;
    this._capitalization = options.capitalization;
  }

  get value(): number {
    return this._value;
  }

  get type(): RateType {
    return this._type;
  }

  /** Capitalization frequency in days (null for effective rates). */
  get capitalization(): number | null {
    return this._capitalization;
  }

  get isNominal(): boolean {
    return this._type === RateType.NOMINAL;
  }
}
