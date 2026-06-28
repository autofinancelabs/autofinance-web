import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

/**
 * Form label primitive (spartan/helm style). Apply to a native `label`; pair it
 * with an input via the `for`/`id` attributes for accessibility.
 */
@Directive({
  selector: 'label[hlmLabel]',
  exportAs: 'hlmLabel',
  host: { 'data-slot': 'label' },
})
export class HlmLabel {
  constructor() {
    classes(
      () =>
        'flex items-center gap-2 text-sm font-medium leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
    );
  }
}
