/**
 * A percentage expressed as a fraction in `[0, 1)` (e.g. 0.20 = 20%). Immutable.
 * Used for the down-payment (% cuota inicial) and the balloon (% cuotón).
 */
export class Percentage {
  private readonly _value: number;

  constructor(options: {value: number}) {
    this._value = options.value;
  }

  get value(): number {
    return this._value;
  }
}
