import {computed, inject, Service, signal} from '@angular/core';
import {ApiError} from '../../shared/infrastructure/api-error';
import {CreditSimulation} from '../domain/model/credit-simulation.entity';
import {SimulationDraft} from '../domain/model/simulation-draft.command';
import {CreditSimulationsApi} from '../infrastructure/credit-simulations-api';

/**
 * Signal store for the Credit Simulation core: generates a simulation (the backend
 * computes the schedule + indicators), loads one by id, and lists a client's
 * history. `generated` flips true after a successful generate so the results view
 * can react; the generated/loaded aggregate is held in `selected`.
 */
@Service()
export class CreditSimulationStore {
  private readonly api = inject(CreditSimulationsApi);

  private readonly historySignal = signal<CreditSimulation[]>([]);
  private readonly simulationsSignal = signal<CreditSimulation[]>([]);
  private readonly selectedSignal = signal<CreditSimulation | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly generatingSignal = signal(false);
  private readonly errorSignal = signal<ApiError | null>(null);
  private readonly generatedSignal = signal(false);

  readonly history = this.historySignal.asReadonly();
  readonly simulations = this.simulationsSignal.asReadonly();
  readonly selected = this.selectedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly generating = this.generatingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly generated = this.generatedSignal.asReadonly();
  readonly isHistoryEmpty = computed(
    () => !this.loadingSignal() && this.historySignal().length === 0,
  );
  readonly isEmpty = computed(
    () => !this.loadingSignal() && this.simulationsSignal().length === 0,
  );

  /** Generates and persists a simulation; the result lands in `selected`. */
  generate(draft: SimulationDraft): void {
    this.generatingSignal.set(true);
    this.generatedSignal.set(false);
    this.errorSignal.set(null);
    this.api.generate(draft).subscribe({
      next: simulation => {
        this.selectedSignal.set(simulation);
        this.generatedSignal.set(true);
        this.generatingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.generatingSignal.set(false);
      },
    });
  }

  /** Loads a single simulation (e.g. to reopen/show results), exposed via `selected`. */
  loadOne(id: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.selectedSignal.set(null);
    this.api.getById(id).subscribe({
      next: simulation => {
        this.selectedSignal.set(simulation);
        this.loadingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  /** Loads a client's simulation history, exposed via `history`. */
  loadHistory(clientId: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.listByClient(clientId).subscribe({
      next: simulations => {
        this.historySignal.set(simulations);
        this.loadingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  /** Loads all the dealership's simulations (tenant-wide), exposed via `simulations`. */
  loadAll(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.listAll().subscribe({
      next: simulations => {
        this.simulationsSignal.set(simulations);
        this.loadingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  /** Resets transient generate/selection state (call when entering a config form). */
  resetWriteState(): void {
    this.generatingSignal.set(false);
    this.generatedSignal.set(false);
    this.errorSignal.set(null);
    this.selectedSignal.set(null);
  }
}
