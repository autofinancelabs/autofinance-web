import {Pipe, PipeTransform} from '@angular/core';

/**
 * Formats a rate given as a fraction into a localized percentage string
 * (e.g. 0.207856 → "20.7856%"). Pair with `tabular-nums` + the mono font for
 * aligned figures. `maxDigits` caps the decimals shown (default 6); 2 minimum.
 */
@Pipe({name: 'rate'})
export class RatePipe implements PipeTransform {
  transform(value: number | null | undefined, maxDigits = 6): string {
    if (value === null || value === undefined) {
      return '';
    }
    return new Intl.NumberFormat('es-PE', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDigits,
    }).format(value);
  }
}
