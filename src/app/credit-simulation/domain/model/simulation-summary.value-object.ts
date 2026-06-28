import {CostTotal} from './cost-total.value-object';

/**
 * Accumulated totals of a generated simulation: interest, amortization, loan
 * installments, the grand total to pay, and the per-cost breakdown. Amounts are in
 * the operation's currency. Immutable.
 */
export class SimulationSummary {
  private readonly _totalInterest: number;
  private readonly _totalAmortization: number;
  private readonly _totalLoanInstallments: number;
  private readonly _totalToPay: number;
  private readonly _totalsPerCost: CostTotal[];

  constructor(options: {
    totalInterest: number;
    totalAmortization: number;
    totalLoanInstallments: number;
    totalToPay: number;
    totalsPerCost: CostTotal[];
  }) {
    this._totalInterest = options.totalInterest;
    this._totalAmortization = options.totalAmortization;
    this._totalLoanInstallments = options.totalLoanInstallments;
    this._totalToPay = options.totalToPay;
    this._totalsPerCost = options.totalsPerCost;
  }

  get totalInterest(): number {
    return this._totalInterest;
  }

  get totalAmortization(): number {
    return this._totalAmortization;
  }

  get totalLoanInstallments(): number {
    return this._totalLoanInstallments;
  }

  get totalToPay(): number {
    return this._totalToPay;
  }

  get totalsPerCost(): CostTotal[] {
    return this._totalsPerCost;
  }
}
