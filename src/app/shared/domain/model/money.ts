import {Currency} from './currency';

/**
 * A monetary amount in a single currency (technical kernel value object, reused
 * across contexts — vehicle sale price, loan amounts, schedule flows…).
 *
 * The frontend does not perform monetary arithmetic (the backend computes all
 * figures), so `amount` is a plain number used for display and transport.
 */
export class Money {
  private readonly _amount: number;
  private readonly _currency: Currency;

  constructor(options: {amount: number; currency: Currency}) {
    this._amount = options.amount;
    this._currency = options.currency;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): Currency {
    return this._currency;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }
}
