import {Component, inject, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {AuthStore} from '../../../../iam/application/auth.store';
import {Brand} from '../brand/brand';
import {ThemeToggle} from '../theme-toggle/theme-toggle';

/**
 * Authenticated application shell: a topbar (brand + theme toggle, with a mobile
 * menu button) and a sidebar (navigation + current user + sign-out). The sidebar
 * is fixed on desktop and a slide-in drawer on mobile.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmButton, Brand, ThemeToggle],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authStore.currentUser;
  protected readonly drawerOpen = signal(false);

  protected toggleDrawer(): void {
    this.drawerOpen.update(open => !open);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected signOut(): void {
    this.authStore.signOut();
    void this.router.navigate(['/sign-in']);
  }
}
