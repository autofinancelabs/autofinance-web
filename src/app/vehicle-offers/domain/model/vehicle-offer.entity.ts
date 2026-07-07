import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Money} from '../../../shared/domain/model/money';

/**
 * A vehicle offer: the vehicle and its sale price. Serves as the basis for a
 * credit simulation. Scoped to the dealership (tenant) server-side; the frontend
 * only references it by `id`.
 */
export class VehicleOffer implements BaseEntity {
  private readonly _id: string;
  private readonly _make: string;
  private readonly _model: string;
  private readonly _year: number;
  private readonly _salePrice: Money;

  constructor(options: {id: string; make: string; model: string; year: number; salePrice: Money}) {
    this._id = options.id;
    this._make = options.make;
    this._model = options.model;
    this._year = options.year;
    this._salePrice = options.salePrice;
  }

  get id(): string {
    return this._id;
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

  get salePrice(): Money {
    return this._salePrice;
  }
}
