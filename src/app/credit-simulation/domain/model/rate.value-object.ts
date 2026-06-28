import {Capitalization} from './capitalization';
import {RateType} from './rate-type';

/**
 * An interest rate: its value (a fraction, e.g. 0.15 = 15%), its type
 * (nominal/effective) and, for nominal rates, the capitalization frequency.
 * Immutable. Used both for the financing rate and for the cost of capital (COK).
 */
export class Rate {
  private readonly _value: number;
  private readonly _type: RateType;
  private readonly _capitalization: Capitalization | null;

  constructor(options: {value: number; type: RateType; capitalization: Capitalization | null}) {
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

  get capitalization(): Capitalization | null {
    return this._capitalization;
  }

  get isNominal(): boolean {
    return this._type === RateType.NOMINAL;
  }
}
