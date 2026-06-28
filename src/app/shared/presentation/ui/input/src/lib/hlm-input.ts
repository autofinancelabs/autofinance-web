import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

/**
 * Text input primitive (spartan/helm style). Apply to native `input`/`textarea`.
 * Pairs with the Signal Forms `[formField]` directive for binding.
 */
@Directive({
  selector: 'input[hlmInput], textarea[hlmInput]',
  exportAs: 'hlmInput',
  host: { 'data-slot': 'input' },
})
export class HlmInput {
  constructor() {
    classes(
      () =>
        'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    );
  }
}
