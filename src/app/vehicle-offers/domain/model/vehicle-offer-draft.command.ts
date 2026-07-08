import {Currency} from '../../../shared/domain/model/currency';
import {Vehicle3dModel} from './vehicle-3d-model';

/**
 * The create/update intent for a vehicle offer (the data the advisor enters).
 * `salePrice` is a plain number + `currency` (the backend nests them only in the
 * response). `model3d` is `null` when the advisor did not generate a 3D model.
 */
export class VehicleOfferDraft {
  private readonly _make: string;
  private readonly _model: string;
  private readonly _year: number;
  private readonly _salePrice: number;
  private readonly _currency: Currency;
  private readonly _model3d: Vehicle3dModel | null;

  constructor(options: {
    make: string;
    model: string;
    year: number;
    salePrice: number;
    currency: Currency;
    model3d: Vehicle3dModel | null;
  }) {
    this._make = options.make;
    this._model = options.model;
    this._year = options.year;
    this._salePrice = options.salePrice;
    this._currency = options.currency;
    this._model3d = options.model3d;
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

  get model3d(): Vehicle3dModel | null {
    return this._model3d;
  }
}
