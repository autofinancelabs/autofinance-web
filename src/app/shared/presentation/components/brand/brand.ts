import {Component, computed, inject} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {ThemeStore} from '../../theme/theme.store';

/**
 * The AutoFinance brand lockup: the chevron logo (theme-aware variant) plus the
 * "Auto" (foreground) + "Finance" (primary) wordmark. Used in the app topbar.
 */
@Component({
  selector: 'app-brand',
  imports: [NgOptimizedImage],
  template: `
    <span class="brand">
      <img [ngSrc]="logoSrc()" width="30" height="28" alt="" class="brand__logo" priority />
      <span class="brand__name">
        <span class="brand__auto">Auto</span><span class="brand__finance">Finance</span>
      </span>
    </span>
  `,
  styles: [
    `
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .brand__logo {
        height: auto;
      }
      .brand__name {
        font-size: 1.125rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1;
      }
      .brand__auto {
        color: var(--foreground);
      }
      .brand__finance {
        color: var(--primary);
      }
    `,
  ],
})
export class Brand {
  private readonly theme = inject(ThemeStore);

  protected readonly logoSrc = computed(() =>
    this.theme.isDark() ? 'autofinance-logo-dark.webp' : 'autofinance-logo-light.webp',
  );
}
