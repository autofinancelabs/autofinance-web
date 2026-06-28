import {ApplicationRef, inject, Injectable, signal} from '@angular/core';

export type ToastVariant = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

/**
 * Toast notifications: the public API callers use (e.g. the error interceptor
 * for operational failures) plus the signal queue the `Toaster` component
 * renders. Toasts auto-dismiss after a few seconds; the user can also close them.
 *
 * A root singleton (`providedIn: 'root'`) so the interceptor and the shell's
 * Toaster share one queue. Toasts are usually raised from outside a tracked
 * reactive context (an HTTP error callback, a timer), so each mutation is
 * followed by `ApplicationRef.tick()` to flush the (zoneless) change detection.
 */
@Injectable({providedIn: 'root'})
export class NotificationService {
  private static readonly autoDismissMs = 5000;

  private readonly appRef = inject(ApplicationRef);
  private readonly toastsSignal = signal<Toast[]>([]);
  private nextId = 0;

  /** The active toasts, oldest first. */
  readonly toasts = this.toastsSignal.asReadonly();

  error(message: string): void {
    this.show(message, 'error');
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  /** Dismisses a toast (e.g. from its close button). */
  dismiss(id: number): void {
    this.removeToast(id);
  }

  private show(message: string, variant: ToastVariant): void {
    const id = this.nextId++;
    this.toastsSignal.update(toasts => [...toasts, {id, message, variant}]);
    this.appRef.tick();
    setTimeout(() => {
      this.removeToast(id);
      this.appRef.tick();
    }, NotificationService.autoDismissMs);
  }

  private removeToast(id: number): void {
    this.toastsSignal.update(toasts => toasts.filter(toast => toast.id !== id));
  }
}
