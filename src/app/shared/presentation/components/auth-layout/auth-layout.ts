import {Component, computed, inject} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {ThemeToggle} from '../theme-toggle/theme-toggle';
import {ThemeStore} from '../../theme/theme.store';

/**
 * Split-screen shell for the authentication screens (sign-in, sign-up): a brand
 * panel (logo, tagline, value points) beside the routed form. Collapses to a
 * single stacked column on small screens. Includes the theme toggle.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [NgOptimizedImage, RouterOutlet, ThemeToggle],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  private readonly theme = inject(ThemeStore);

  /** Logo variant matched to the active theme. */
  protected readonly logoSrc = computed(() =>
    this.theme.isDark() ? 'autofinance-logo-dark.webp' : 'autofinance-logo-light.webp',
  );
}
