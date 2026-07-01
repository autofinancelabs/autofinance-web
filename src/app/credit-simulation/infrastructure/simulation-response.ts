import {BaseResource} from '../../shared/infrastructure/base-response';
import {MoneyResource} from '../../shared/infrastructure/money-response';

/**
 * Request body to generate (and persist) a simulation. Enums travel as strings;
 * `capitalization` is omitted for effective rates. `salePrice`/`currency` are NOT
 * sent — the backend resolves them from `vehicleOfferId`. `gracePlan` has one
 * entry per installment.
 */
export interface GenerateSimulationResource {
  clientId: string;
  vehicleOfferId: string;
  rateValue: number;
  rateType: string;
  capitalization?: number;
  ratePeriod?: number;
  initialPercentage: number;
  balloonPercentage: number;
  numberOfInstallments: number;
  frequencyDays: number;
  daysPerYear: number;
  gracePlan: string[];
  costs: CostResource[];
  costOfCapitalAnnual: number;
}

/** A configurable cost (request and response). */
export interface CostResource {
  name: string;
  value: number;
  basis: string;
  timing: string;
  embedded: boolean;
}

/** An interest rate (financing rate or cost of capital). */
export interface RateResource {
  value: number;
  type: string;
  capitalization: number | null;
  ratePeriod: number | null;
}

/** The loan term. */
export interface TermResource {
  numberOfInstallments: number;
  frequencyDays: number;
  installmentsPerYear: number;
  daysPerYear: number;
}

/** Transparency indicators + rate echo. */
export interface IndicatorsResource {
  npv: number;
  periodicIrr: number;
  tcea: number;
  effectiveAnnualRate: number;
  periodicRate: number;
  periodicCostOfCapital: number;
}

/** A cost as charged in a schedule period. */
export interface AppliedCostResource {
  name: string;
  amount: number;
}

/** One schedule row (balloon block + regular block + per-period costs). */
export interface ScheduleRowResource {
  period: number;
  graceType: string;
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
  appliedCosts: AppliedCostResource[];
}

/** Accumulated totals; `totalsPerCost` keyed by cost name. */
export interface SummaryResource {
  totalInterest: number;
  totalAmortization: number;
  totalLoanInstallments: number;
  totalToPay: number;
  totalsPerCost: Record<string, number>;
}

/** Full response body for a generated/loaded simulation. */
export interface SimulationResource extends BaseResource {
  clientId: string;
  vehicleOfferId: string;
  salePrice: MoneyResource;
  rate: RateResource;
  initialPercentage: number;
  balloonPercentage: number;
  term: TermResource;
  grace: string[];
  costs: CostResource[];
  costOfCapital: RateResource;
  loanAmount: MoneyResource;
  financedBalance: MoneyResource;
  indicators: IndicatorsResource;
  schedule: ScheduleRowResource[];
  summary: SummaryResource;
  state: string;
}
