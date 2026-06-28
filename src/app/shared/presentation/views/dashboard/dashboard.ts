import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {
  HlmCard,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@spartan-ng/helm/card';
import {AuthStore} from '../../../../iam/application/auth.store';

/**
 * Landing view of the authenticated app: a greeting plus quick-access cards to
 * the available (and upcoming) areas.
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, HlmCard, HlmCardHeader, HlmCardTitle, HlmCardDescription],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authStore = inject(AuthStore);

  protected readonly username = computed(() => this.authStore.currentUser()?.username ?? '');
}
