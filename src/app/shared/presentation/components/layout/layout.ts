import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {AuthStore} from '../../../../iam/application/auth.store';
import {FooterContent} from '../footer-content/footer-content';
import {ThemeToggle} from '../theme-toggle/theme-toggle';

/**
 * Application shell of the authenticated app: top navigation, current user +
 * sign-out, theme toggle, the routed content outlet and the footer.
 */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterContent, ThemeToggle, HlmButton],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  /** Top-level navigation entries, labelled in the product's language (Spanish). */
  protected readonly options = [
    {link: '/home', label: 'Inicio'},
    {link: '/vehicle-offers', label: 'Ofertas'},
    {link: '/about', label: 'Acerca de'},
  ];

  protected readonly currentUser = this.authStore.currentUser;

  protected signOut(): void {
    this.authStore.signOut();
    void this.router.navigate(['/sign-in']);
  }
}
