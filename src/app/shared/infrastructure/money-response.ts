/**
 * Wire shape for a monetary amount, as the backend nests it (e.g. a vehicle
 * offer's `salePrice`). `currency` is a string on the wire ("PEN" | "USD").
 */
export interface MoneyResource {
  amount: number;
  currency: string;
}
