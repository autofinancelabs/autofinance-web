import {computed, inject, Service, signal} from '@angular/core';
import {ApiError} from '../../shared/infrastructure/api-error';
import {Client} from '../domain/model/client.entity';
import {ClientDraft} from '../domain/model/client-draft.command';
import {ClientsApi} from '../infrastructure/clients-api';

/**
 * Signal store for the Clients context: holds the dealership's clients and
 * orchestrates list/create/update. `saved` flips true after a successful write so
 * the form view can navigate away. On update only the contact data is persisted
 * (the identity document is immutable).
 */
@Service()
export class ClientsStore {
  private readonly api = inject(ClientsApi);

  private readonly clientsSignal = signal<Client[]>([]);
  private readonly selectedSignal = signal<Client | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly savingSignal = signal(false);
  private readonly errorSignal = signal<ApiError | null>(null);
  private readonly savedSignal = signal(false);

  readonly clients = this.clientsSignal.asReadonly();
  readonly selected = this.selectedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly saved = this.savedSignal.asReadonly();
  readonly isEmpty = computed(() => !this.loadingSignal() && this.clientsSignal().length === 0);

  load(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.getAll().subscribe({
      next: clients => {
        this.clientsSignal.set(clients);
        this.loadingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  /** Loads a single client (for the edit form), exposed via `selected`. */
  loadOne(id: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.selectedSignal.set(null);
    this.api.getById(id).subscribe({
      next: client => {
        this.selectedSignal.set(client);
        this.loadingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  create(draft: ClientDraft): void {
    this.beginSave();
    this.api.create(draft).subscribe({
      next: () => this.onSaved(),
      error: (error: ApiError) => this.onSaveError(error),
    });
  }

  update(id: string, draft: ClientDraft): void {
    this.beginSave();
    this.api.update(id, draft).subscribe({
      next: () => this.onSaved(),
      error: (error: ApiError) => this.onSaveError(error),
    });
  }

  /** Resets transient write/selection state (call when entering a form). */
  resetWriteState(): void {
    this.savingSignal.set(false);
    this.savedSignal.set(false);
    this.errorSignal.set(null);
    this.selectedSignal.set(null);
  }

  private beginSave(): void {
    this.savingSignal.set(true);
    this.savedSignal.set(false);
    this.errorSignal.set(null);
  }

  private onSaved(): void {
    this.savingSignal.set(false);
    this.savedSignal.set(true);
  }

  private onSaveError(error: ApiError): void {
    this.errorSignal.set(error);
    this.savingSignal.set(false);
  }
}
