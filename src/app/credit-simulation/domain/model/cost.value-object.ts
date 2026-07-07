import {CostBasis} from './cost-basis';
import {CostTiming} from './cost-timing';

/**
 * A configurable cost of the operation (notarial fee, credit-life insurance, GPS…).
 * `value` is an amount when `basis = FIXED`, or a rate when `basis = ON_BALANCE` /
 * `ON_SALE_PRICE`. `embedded` marks an on-balance periodic rate folded into the
 * installment rate (the desgravamen variant). Immutable. Used in the draft (input)
 * and on the generated simulation (output).
 */
export class Cost {
  private readonly _name: string;
  private readonly _value: number;
  private readonly _basis: CostBasis;
  private readonly _timing: CostTiming;
  private readonly _embedded: boolean;

  constructor(options: {
    name: string;
    value: number;
    basis: CostBasis;
    timing: CostTiming;
    embedded: boolean;
  }) {
    this._name = options.name;
    this._value = options.value;
    this._basis = options.basis;
    this._timing = options.timing;
    this._embedded = options.embedded;
  }

  get name(): string {
    return this._name;
  }

  get value(): number {
    return this._value;
  }

  get basis(): CostBasis {
    return this._basis;
  }

  get timing(): CostTiming {
    return this._timing;
  }

  get embedded(): boolean {
    return this._embedded;
  }
}
