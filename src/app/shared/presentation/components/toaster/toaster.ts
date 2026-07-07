import {Component, inject} from '@angular/core';
import {NotificationService} from '../../../infrastructure/notification.service';

/**
 * Renders the {@link NotificationService} toast queue: a fixed, animated stack
 * with a semantic accent per variant (error / success / info), an icon, and a
 * close button. Signal-driven, so it works under zoneless change detection.
 * Mount once in the app shell.
 */
@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.html',
  styleUrl: './toaster.css',
})
export class Toaster {
  protected readonly notifications = inject(NotificationService);
}
