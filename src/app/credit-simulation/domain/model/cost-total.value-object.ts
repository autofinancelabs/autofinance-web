/**
 * An accumulated total for one cost across the whole schedule (one entry of the
 * summary's `totalsPerCost`). Immutable.
 */
export class CostTotal {
  private readonly _name: string;
  private readonly _total: number;

  constructor(options: {name: string; total: number}) {
    this._name = options.name;
    this._total = options.total;
  }

  get name(): string {
    return this._name;
  }

  get total(): number {
    return this._total;
  }
}
