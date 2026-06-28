import {Capitalization} from './capitalization';
import {Cost} from './cost.value-object';
import {GraceType} from './grace-type';
import {RateType} from './rate-type';

/**
 * The "generate simulation" intent (the data the advisor configures). Flat,
 * form-shaped values that the assembler maps to the request body. `salePrice` and
 * `currency` are NOT here — the backend resolves them from `vehicleOfferId`.
 * `capitalization` is null unless the rate is nominal. `gracePlan` has one entry
 * per installment.
 */
export class SimulationDraft {
  private readonly _clientId: string;
  private readonly _vehicleOfferId: string;
  private readonly _rateValue: number;
  private readonly _rateType: RateType;
  private readonly _capitalization: Capitalization | null;
  private readonly _initialPercentage: number;
  private readonly _balloonPercentage: number;
  private readonly _numberOfInstallments: number;
  private readonly _frequencyDays: number;
  private readonly _daysPerYear: number;
  private readonly _gracePlan: GraceType[];
  private readonly _costs: Cost[];
  private readonly _costOfCapitalAnnual: number;

  constructor(options: {
    clientId: string;
    vehicleOfferId: string;
    rateValue: number;
    rateType: RateType;
    capitalization: Capitalization | null;
    initialPercentage: number;
    balloonPercentage: number;
    numberOfInstallments: number;
    frequencyDays: number;
    daysPerYear: number;
    gracePlan: GraceType[];
    costs: Cost[];
    costOfCapitalAnnual: number;
  }) {
    this._clientId = options.clientId;
    this._vehicleOfferId = options.vehicleOfferId;
    this._rateValue = options.rateValue;
    this._rateType = options.rateType;
    this._capitalization = options.capitalization;
    this._initialPercentage = options.initialPercentage;
    this._balloonPercentage = options.balloonPercentage;
    this._numberOfInstallments = options.numberOfInstallments;
    this._frequencyDays = options.frequencyDays;
    this._daysPerYear = options.daysPerYear;
    this._gracePlan = options.gracePlan;
    this._costs = options.costs;
    this._costOfCapitalAnnual = options.costOfCapitalAnnual;
  }

  get clientId(): string {
    return this._clientId;
  }

  get vehicleOfferId(): string {
    return this._vehicleOfferId;
  }

  get rateValue(): number {
    return this._rateValue;
  }

  get rateType(): RateType {
    return this._rateType;
  }

  get capitalization(): Capitalization | null {
    return this._capitalization;
  }

  get initialPercentage(): number {
    return this._initialPercentage;
  }

  get balloonPercentage(): number {
    return this._balloonPercentage;
  }

  get numberOfInstallments(): number {
    return this._numberOfInstallments;
  }

  get frequencyDays(): number {
    return this._frequencyDays;
  }

  get daysPerYear(): number {
    return this._daysPerYear;
  }

  get gracePlan(): GraceType[] {
    return this._gracePlan;
  }

  get costs(): Cost[] {
    return this._costs;
  }

  get costOfCapitalAnnual(): number {
    return this._costOfCapitalAnnual;
  }
}
