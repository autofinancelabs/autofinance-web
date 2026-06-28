import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

/**
 * Field group wrapper (spartan/helm style): stacks a label, its control and the
 * error message with consistent spacing.
 */
@Directive({
  selector: '[hlmFormField]',
  exportAs: 'hlmFormField',
  host: { 'data-slot': 'form-field' },
})
export class HlmFormField {
  constructor() {
    classes(() => 'flex flex-col gap-1.5');
  }
}
