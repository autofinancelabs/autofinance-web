import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Money} from '../../../shared/domain/model/money';
import {Cost} from './cost.value-object';
import {GraceType} from './grace-type';
import {Indicators} from './indicators.value-object';
import {Percentage} from './percentage.value-object';
import {Rate} from './rate.value-object';
import {ScheduleRow} from './schedule-row.value-object';
import {SimulationState} from './simulation-state';
import {SimulationSummary} from './simulation-summary.value-object';
import {Term} from './term.value-object';

/**
 * A credit simulation (the core aggregate): groups the configuration, the computed
 * schedule and the transparency indicators. References its client and vehicle
 * offer by id. The schedule, summary and indicators are computed by the backend;
 * the frontend models and renders them.
 */
export class CreditSimulation implements BaseEntity {
  private readonly _id: string;
  private readonly _clientId: string;
  private readonly _vehicleOfferId: string;
  private readonly _salePrice: Money;
  private readonly _rate: Rate;
  private readonly _initialPercentage: Percentage;
  private readonly _balloonPercentage: Percentage;
  private readonly _term: Term;
  private readonly _grace: GraceType[];
  private readonly _costs: Cost[];
  private readonly _costOfCapital: Rate;
  private readonly _loanAmount: Money;
  private readonly _financedBalance: Money;
  private readonly _indicators: Indicators;
  private readonly _schedule: ScheduleRow[];
  private readonly _summary: SimulationSummary;
  private readonly _state: SimulationState;
  private readonly _createdAt: Date | null;
  private readonly _updatedAt: Date | null;

  constructor(options: {
    id: string;
    clientId: string;
    vehicleOfferId: string;
    salePrice: Money;
    rate: Rate;
    initialPercentage: Percentage;
    balloonPercentage: Percentage;
    term: Term;
    grace: GraceType[];
    costs: Cost[];
    costOfCapital: Rate;
    loanAmount: Money;
    financedBalance: Money;
    indicators: Indicators;
    schedule: ScheduleRow[];
    summary: SimulationSummary;
    state: SimulationState;
    createdAt: Date | null;
    updatedAt: Date | null;
  }) {
    this._id = options.id;
    this._clientId = options.clientId;
    this._vehicleOfferId = options.vehicleOfferId;
    this._salePrice = options.salePrice;
    this._rate = options.rate;
    this._initialPercentage = options.initialPercentage;
    this._balloonPercentage = options.balloonPercentage;
    this._term = options.term;
    this._grace = options.grace;
    this._costs = options.costs;
    this._costOfCapital = options.costOfCapital;
    this._loanAmount = options.loanAmount;
    this._financedBalance = options.financedBalance;
    this._indicators = options.indicators;
    this._schedule = options.schedule;
    this._summary = options.summary;
    this._state = options.state;
    this._createdAt = options.createdAt;
    this._updatedAt = options.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get clientId(): string {
    return this._clientId;
  }

  get vehicleOfferId(): string {
    return this._vehicleOfferId;
  }

  get salePrice(): Money {
    return this._salePrice;
  }

  get rate(): Rate {
    return this._rate;
  }

  get initialPercentage(): Percentage {
    return this._initialPercentage;
  }

  get balloonPercentage(): Percentage {
    return this._balloonPercentage;
  }

  get term(): Term {
    return this._term;
  }

  get grace(): GraceType[] {
    return this._grace;
  }

  get costs(): Cost[] {
    return this._costs;
  }

  get costOfCapital(): Rate {
    return this._costOfCapital;
  }

  get loanAmount(): Money {
    return this._loanAmount;
  }

  get financedBalance(): Money {
    return this._financedBalance;
  }

  get indicators(): Indicators {
    return this._indicators;
  }

  get schedule(): ScheduleRow[] {
    return this._schedule;
  }

  get summary(): SimulationSummary {
    return this._summary;
  }

  get state(): SimulationState {
    return this._state;
  }

  /** Creation timestamp (null if not yet persisted). */
  get createdAt(): Date | null {
    return this._createdAt;
  }

  /** Last-modification timestamp (null if not yet persisted). */
  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  /**
   * True when the simulation has been edited after its initial generation, i.e.
   * `updatedAt` is meaningfully later than `createdAt` (1s tolerance for the
   * insert, where both timestamps are set together).
   */
  get edited(): boolean {
    if (this._createdAt === null || this._updatedAt === null) {
      return false;
    }
    return this._updatedAt.getTime() - this._createdAt.getTime() > 1000;
  }
}
