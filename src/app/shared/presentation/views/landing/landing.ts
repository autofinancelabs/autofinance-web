import {Component, effect, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {AuthStore} from '../../../../iam/application/auth.store';
import {Brand} from '../../components/brand/brand';
import {ThemeToggle} from '../../components/theme-toggle/theme-toggle';

/**
 * Public mini landing page shown at the root route `/`: a hero with the value
 * proposition and a call to sign in, over an animated "lights" background, plus a
 * small footer. Authenticated users are redirected to the dashboard.
 */
@Component({
  selector: 'app-landing',
  imports: [RouterLink, HlmButton, Brand, ThemeToggle],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        void this.router.navigate(['/dashboard']);
      }
    });
  }
}
