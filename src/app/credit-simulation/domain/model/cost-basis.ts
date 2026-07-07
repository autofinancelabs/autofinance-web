/**
 * How a cost's `value` is applied: a fixed amount, a rate on the outstanding
 * balance (e.g. credit-life insurance/desgravamen) or a rate on the sale price
 * (e.g. all-risk insurance/riesgo). Mirrors the backend `CostBasis` enum.
 */
export const CostBasis = {
  FIXED: 'FIXED',
  ON_BALANCE: 'ON_BALANCE',
  ON_SALE_PRICE: 'ON_SALE_PRICE',
} as const;

export type CostBasis = (typeof CostBasis)[keyof typeof CostBasis];

/** All cost bases, in display order (for selects). */
export const costBases: readonly CostBasis[] = [
  CostBasis.FIXED,
  CostBasis.ON_BALANCE,
  CostBasis.ON_SALE_PRICE,
];
