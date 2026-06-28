/**
 * Transparency indicators from the debtor's perspective: NPV (VAN), periodic IRR
 * (TIR), TCEA, plus the rate echo (effective annual, periodic rate, periodic cost
 * of capital). Rates are fractions; NPV is in the operation's currency. Immutable.
 */
export class Indicators {
  private readonly _npv: number;
  private readonly _periodicIrr: number;
  private readonly _tcea: number;
  private readonly _effectiveAnnualRate: number;
  private readonly _periodicRate: number;
  private readonly _periodicCostOfCapital: number;

  constructor(options: {
    npv: number;
    periodicIrr: number;
    tcea: number;
    effectiveAnnualRate: number;
    periodicRate: number;
    periodicCostOfCapital: number;
  }) {
    this._npv = options.npv;
    this._periodicIrr = options.periodicIrr;
    this._tcea = options.tcea;
    this._effectiveAnnualRate = options.effectiveAnnualRate;
    this._periodicRate = options.periodicRate;
    this._periodicCostOfCapital = options.periodicCostOfCapital;
  }

  get npv(): number {
    return this._npv;
  }

  get periodicIrr(): number {
    return this._periodicIrr;
  }

  get tcea(): number {
    return this._tcea;
  }

  get effectiveAnnualRate(): number {
    return this._effectiveAnnualRate;
  }

  get periodicRate(): number {
    return this._periodicRate;
  }

  get periodicCostOfCapital(): number {
    return this._periodicCostOfCapital;
  }
}
