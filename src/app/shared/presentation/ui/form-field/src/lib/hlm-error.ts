import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

/**
 * Inline validation error message primitive (spartan/helm style). `aria-live`
 * announces newly shown errors to assistive technology.
 */
@Directive({
  selector: '[hlmError]',
  exportAs: 'hlmError',
  host: { 'data-slot': 'form-error', 'aria-live': 'polite' },
})
export class HlmError {
  constructor() {
    classes(() => 'text-destructive text-sm');
  }
}
