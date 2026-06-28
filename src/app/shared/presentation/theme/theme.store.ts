import {computed, Service, signal} from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * Manages the light/dark theme. On first load it follows the OS preference
 * (`prefers-color-scheme`); once the user toggles, the explicit choice is
 * persisted to `localStorage` and reused. The theme is applied by toggling the
 * `dark` class on the document root (matching `:root.dark` in styles.css).
 *
 * A tiny inline script in index.html applies the same class before bootstrap to
 * avoid a flash of the wrong theme; this store is the runtime source of truth.
 */
@Service()
export class ThemeStore {
  private readonly storageKey = 'autofinance.theme';
  private readonly themeSignal = signal<Theme>(this.resolveInitial());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.applyToDocument(this.themeSignal());
  }

  toggle(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch {
      // Storage unavailable: theme stays in-memory for this session.
    }
    this.applyToDocument(theme);
  }

  private resolveInitial(): Theme {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Ignore storage access errors.
    }
    try {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // matchMedia unavailable (e.g. non-browser): default to light.
    }
    return 'light';
  }

  private applyToDocument(theme: Theme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}
