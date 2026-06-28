import {Pipe, PipeTransform} from '@angular/core';
import {Money} from '../domain/model/money';

/**
 * Formats a {@link Money} as a localized currency string (e.g. `S/ 30,000.00`,
 * `US$ 30,000.00`). Pair with `tabular-nums` + the mono font for aligned figures.
 */
@Pipe({name: 'money'})
export class MoneyPipe implements PipeTransform {
  transform(value: Money | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: value.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value.amount);
  }
}
