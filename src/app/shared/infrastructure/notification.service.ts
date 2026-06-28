import {ApplicationRef, inject, Injectable, signal} from '@angular/core';

export type ToastVariant = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  /** True while the toast plays its exit animation, just before removal. */
  leaving: boolean;
}

/**
 * Toast notifications: the public API callers use (e.g. the error interceptor
 * for backend failures) plus the signal queue the `Toaster` component renders.
 * Toasts auto-dismiss after a few seconds; the user can also close them. Dismissal
 * marks the toast `leaving` so the component can play an exit animation before it
 * is removed.
 *
 * A root singleton so the interceptor and the shell's Toaster share one queue.
 * Mutations are followed by `ApplicationRef.tick()` to flush the (zoneless)
 * change detection, since toasts are usually raised from outside a tracked
 * reactive context (an HTTP error callback, a timer).
 */
@Injectable({providedIn: 'root'})
export class NotificationService {
  private static readonly autoDismissMs = 5000;
  /** Must match the exit animation duration in the Toaster styles. */
  private static readonly exitMs = 180;

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

  /** Dismisses a toast: plays its exit animation, then removes it. */
  dismiss(id: number): void {
    let found = false;
    this.toastsSignal.update(toasts =>
      toasts.map(toast => {
        if (toast.id === id && !toast.leaving) {
          found = true;
          return {...toast, leaving: true};
        }
        return toast;
      }),
    );
    if (!found) {
      return;
    }
    this.appRef.tick();
    setTimeout(() => {
      this.toastsSignal.update(toasts => toasts.filter(toast => toast.id !== id));
      this.appRef.tick();
    }, NotificationService.exitMs);
  }

  private show(message: string, variant: ToastVariant): void {
    const id = this.nextId++;
    this.toastsSignal.update(toasts => [...toasts, {id, message, variant, leaving: false}]);
    this.appRef.tick();
    setTimeout(() => this.dismiss(id), NotificationService.autoDismissMs);
  }
}
