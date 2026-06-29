import {Pipe, PipeTransform} from '@angular/core';

/**
 * Formats a plain number as a localized decimal with 2 fraction digits and no
 * currency symbol (e.g. 9015.99 → "9,015.99"). For dense schedule cells, where
 * the operation's currency is shown once in the header rather than per cell. Pair
 * with `tabular-nums` + the mono font.
 */
@Pipe({name: 'amount'})
export class AmountPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
