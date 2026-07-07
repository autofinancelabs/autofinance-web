/**
 * A cost as actually charged in a single schedule period: its name (matching a
 * configured {@link Cost}) and the amount applied that period. Immutable.
 */
export class AppliedCost {
  private readonly _name: string;
  private readonly _amount: number;

  constructor(options: {name: string; amount: number}) {
    this._name = options.name;
    this._amount = options.amount;
  }

  get name(): string {
    return this._name;
  }

  get amount(): number {
    return this._amount;
  }
}
