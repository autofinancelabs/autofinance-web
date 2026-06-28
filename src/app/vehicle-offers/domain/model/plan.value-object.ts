/**
 * A standard financing plan for an offer (e.g. "Plan 36" with 36 installments).
 * Optional on an offer: when present, both fields are set and `installments > 0`.
 */
export class Plan {
  private readonly _name: string;
  private readonly _installments: number;

  constructor(options: {name: string; installments: number}) {
    this._name = options.name;
    this._installments = options.installments;
  }

  get name(): string {
    return this._name;
  }

  get installments(): number {
    return this._installments;
  }
}
