import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {provideBrnTooltipDefaultOptions} from '@spartan-ng/brain/tooltip';
import {provideSpartanHlm} from '@spartan-ng/helm/utils';

/**
 * Global tooltip config (spartan/helm style): a quick-opening, sober (neutral
 * dark) bubble rendered in a CDK overlay (so it is never clipped by scroll
 * containers), with fade/zoom enter & exit animations. No arrow. Register once
 * in the app providers.
 */
export function provideHlmTooltip(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideSpartanHlm(),
    provideBrnTooltipDefaultOptions({
      showDelay: 150,
      hideDelay: 0,
      tooltipContentClasses:
        'z-50 w-fit max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-md ' +
        'animate-in fade-in-0 zoom-in-95 ' +
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      // No arrow — keep the tooltip sober and avoid a mis-centered triangle.
      arrowClasses: () => 'hidden',
      svgClasses: 'hidden',
    }),
  ]);
}
