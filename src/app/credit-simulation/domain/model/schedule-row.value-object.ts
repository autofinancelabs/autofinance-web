import {AppliedCost} from './applied-cost.value-object';
import {GraceType} from './grace-type';

/**
 * One row of the payment schedule. Runs two parallel blocks: the deferred balloon
 * (cuotón) and the regular installment. Amounts are plain numbers in the
 * operation's single currency (the schedule shows the currency once, not per
 * cell); `appliedCosts` is the per-period cost breakdown. Immutable.
 */
export class ScheduleRow {
  private readonly _period: number;
  private readonly _graceType: GraceType;
  private readonly _openingBalanceBalloon: number;
  private readonly _interestBalloon: number;
  private readonly _balloonCreditLifeInsurance: number;
  private readonly _closingBalanceBalloon: number;
  private readonly _openingBalance: number;
  private readonly _interest: number;
  private readonly _installment: number;
  private readonly _amortization: number;
  private readonly _closingBalance: number;
  private readonly _cashFlow: number;
  private readonly _appliedCosts: AppliedCost[];

  constructor(options: {
    period: number;
    graceType: GraceType;
    openingBalanceBalloon: number;
    interestBalloon: number;
    balloonCreditLifeInsurance: number;
    closingBalanceBalloon: number;
    openingBalance: number;
    interest: number;
    installment: number;
    amortization: number;
    closingBalance: number;
    cashFlow: number;
    appliedCosts: AppliedCost[];
  }) {
    this._period = options.period;
    this._graceType = options.graceType;
    this._openingBalanceBalloon = options.openingBalanceBalloon;
    this._interestBalloon = options.interestBalloon;
    this._balloonCreditLifeInsurance = options.balloonCreditLifeInsurance;
    this._closingBalanceBalloon = options.closingBalanceBalloon;
    this._openingBalance = options.openingBalance;
    this._interest = options.interest;
    this._installment = options.installment;
    this._amortization = options.amortization;
    this._closingBalance = options.closingBalance;
    this._cashFlow = options.cashFlow;
    this._appliedCosts = options.appliedCosts;
  }

  get period(): number {
    return this._period;
  }

  get graceType(): GraceType {
    return this._graceType;
  }

  get openingBalanceBalloon(): number {
    return this._openingBalanceBalloon;
  }

  get interestBalloon(): number {
    return this._interestBalloon;
  }

  get balloonCreditLifeInsurance(): number {
    return this._balloonCreditLifeInsurance;
  }

  get closingBalanceBalloon(): number {
    return this._closingBalanceBalloon;
  }

  get openingBalance(): number {
    return this._openingBalance;
  }

  get interest(): number {
    return this._interest;
  }

  get installment(): number {
    return this._installment;
  }

  get amortization(): number {
    return this._amortization;
  }

  get closingBalance(): number {
    return this._closingBalance;
  }

  get cashFlow(): number {
    return this._cashFlow;
  }

  get appliedCosts(): AppliedCost[] {
    return this._appliedCosts;
  }

  /** Amount of a named cost applied this period (0 if not present). */
  costNamed(name: string): number {
    return this._appliedCosts.find(cost => cost.name === name)?.amount ?? 0;
  }
}
