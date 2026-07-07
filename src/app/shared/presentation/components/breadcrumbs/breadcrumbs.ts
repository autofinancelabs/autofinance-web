import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';

export interface Breadcrumb {
  label: string;
  /** Router link for all items except the current (last) one. */
  link?: string;
}

/**
 * Breadcrumb trail. The last item is rendered as the current page (no link).
 */
@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink],
  template: `
    <nav class="breadcrumbs" aria-label="Ruta de navegación">
      <ol>
        @for (item of items(); track item.label; let last = $last) {
          <li>
            @if (item.link && !last) {
              <a [routerLink]="item.link">{{ item.label }}</a>
            } @else {
              <span aria-current="page">{{ item.label }}</span>
            }
            @if (!last) {
              <span class="sep" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .breadcrumbs ol {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
      }
      .breadcrumbs li {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      .breadcrumbs a {
        color: var(--muted-foreground);
        text-decoration: none;
        transition: color 120ms ease;
      }
      .breadcrumbs a:hover {
        color: var(--foreground);
      }
      .breadcrumbs span[aria-current] {
        color: var(--foreground);
        font-weight: 500;
      }
      .sep {
        display: inline-flex;
        color: var(--muted-foreground);
      }
    `,
  ],
})
export class Breadcrumbs {
  readonly items = input.required<Breadcrumb[]>();
}
