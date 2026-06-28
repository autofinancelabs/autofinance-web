import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {FooterContent} from '../footer-content/footer-content';
import {ThemeToggle} from '../theme-toggle/theme-toggle';

/**
 * Application shell of the shared kernel: top navigation, the routed content
 * outlet and the footer. Visual styling will move to spartan/ui as the bounded
 * contexts and their views are built.
 */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterContent, ThemeToggle],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  /** Top-level navigation entries, labelled in the product's language (Spanish). */
  protected readonly options = [
    {link: '/home', label: 'Inicio'},
    {link: '/about', label: 'Acerca de'},
  ];
}
