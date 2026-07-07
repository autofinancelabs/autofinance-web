/**
 * The loan term: number of installments (n), days per period, derived installments
 * per year, and the days-per-year convention (360 for 30/360). Immutable.
 */
export class Term {
  private readonly _numberOfInstallments: number;
  private readonly _frequencyDays: number;
  private readonly _installmentsPerYear: number;
  private readonly _daysPerYear: number;

  constructor(options: {
    numberOfInstallments: number;
    frequencyDays: number;
    installmentsPerYear: number;
    daysPerYear: number;
  }) {
    this._numberOfInstallments = options.numberOfInstallments;
    this._frequencyDays = options.frequencyDays;
    this._installmentsPerYear = options.installmentsPerYear;
    this._daysPerYear = options.daysPerYear;
  }

  get numberOfInstallments(): number {
    return this._numberOfInstallments;
  }

  get frequencyDays(): number {
    return this._frequencyDays;
  }

  get installmentsPerYear(): number {
    return this._installmentsPerYear;
  }

  get daysPerYear(): number {
    return this._daysPerYear;
  }
}
