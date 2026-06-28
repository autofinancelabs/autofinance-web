import {Currency} from '../../../shared/domain/model/currency';

/**
 * The create/update intent for a vehicle offer (the data the advisor enters).
 * `salePrice` is a plain number + `currency` (the backend nests them only in the
 * response). The plan is all-or-nothing: both `planName` and `planInstallments`,
 * or both null.
 */
export class VehicleOfferDraft {
  private readonly _make: string;
  private readonly _model: string;
  private readonly _year: number;
  private readonly _salePrice: number;
  private readonly _currency: Currency;
  private readonly _planName: string | null;
  private readonly _planInstallments: number | null;

  constructor(options: {
    make: string;
    model: string;
    year: number;
    salePrice: number;
    currency: Currency;
    planName: string | null;
    planInstallments: number | null;
  }) {
    this._make = options.make;
    this._model = options.model;
    this._year = options.year;
    this._salePrice = options.salePrice;
    this._currency = options.currency;
    this._planName = options.planName;
    this._planInstallments = options.planInstallments;
  }

  get make(): string {
    return this._make;
  }

  get model(): string {
    return this._model;
  }

  get year(): number {
    return this._year;
  }

  get salePrice(): number {
    return this._salePrice;
  }

  get currency(): Currency {
    return this._currency;
  }

  get planName(): string | null {
    return this._planName;
  }

  get planInstallments(): number | null {
    return this._planInstallments;
  }
}
