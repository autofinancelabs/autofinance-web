import {computed, inject, Service, signal} from '@angular/core';
import {ApiError} from '../../shared/infrastructure/api-error';
import {VehicleOffer} from '../domain/model/vehicle-offer.entity';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {VehicleOffersApi} from '../infrastructure/vehicle-offers-api';

/**
 * Signal store for the Vehicle Offers context: holds the dealership's offers and
 * orchestrates list/create/update. `saved` flips true after a successful write so
 * the form view can navigate away.
 */
@Service()
export class VehicleOffersStore {
  private readonly api = inject(VehicleOffersApi);

  private readonly offersSignal = signal<VehicleOffer[]>([]);
  private readonly selectedSignal = signal<VehicleOffer | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly savingSignal = signal(false);
  private readonly errorSignal = signal<ApiError | null>(null);
  private readonly savedSignal = signal(false);

  readonly offers = this.offersSignal.asReadonly();
  readonly selected = this.selectedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly saved = this.savedSignal.asReadonly();
  readonly isEmpty = computed(() => !this.loadingSignal() && this.offersSignal().length === 0);

  load(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.getAll().subscribe({
      next: offers => {
        this.offersSignal.set(offers);
        this.loadingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  /** Loads a single offer (for the edit form), exposed via `selected`. */
  loadOne(id: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.selectedSignal.set(null);
    this.api.getById(id).subscribe({
      next: offer => {
        this.selectedSignal.set(offer);
        this.loadingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  create(draft: VehicleOfferDraft): void {
    this.beginSave();
    this.api.create(draft).subscribe({
      next: () => this.onSaved(),
      error: (error: ApiError) => this.onSaveError(error),
    });
  }

  update(id: string, draft: VehicleOfferDraft): void {
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
