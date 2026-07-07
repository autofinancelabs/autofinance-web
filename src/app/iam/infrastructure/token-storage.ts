import {Service} from '@angular/core';

/**
 * Persists the JWT bearer token in `localStorage` so the session survives tab
 * reloads and restarts (the backend token is valid for 720 minutes).
 *
 * This is a dependency-free leaf service: both HTTP interceptors and the
 * `AuthStore` inject it, which is what breaks the potential
 * `AuthStore → HttpClient → interceptor → AuthStore` DI cycle. All access is
 * wrapped in try/catch to tolerate private-mode / disabled storage.
 */
@Service()
export class TokenStorage {
  private readonly key = 'autofinance.token';

  getToken(): string | null {
    try {
      return localStorage.getItem(this.key);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.key, token);
    } catch {
      // Storage unavailable (private mode / quota): the session stays in-memory only.
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {
      // Ignore storage errors when clearing.
    }
  }
}
