import {DatePipe} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInput} from '@spartan-ng/helm/input';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {AmountPipe} from '../../../../shared/presentation/amount.pipe';
import {Client} from '../../../../clients/domain/model/client.entity';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {VehicleOffer} from '../../../../vehicle-offers/domain/model/vehicle-offer.entity';
import {VehicleOffersStore} from '../../../../vehicle-offers/application/vehicle-offers.store';
import {CreditSimulation} from '../../../domain/model/credit-simulation.entity';
import {SimulationState} from '../../../domain/model/simulation-state';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';

interface SimulationRow {
  sim: CreditSimulation;
  client: Client | null;
  offer: VehicleOffer | null;
}

/**
 * Tenant-wide list of the advisor's credit simulations. Loads all simulations plus
 * the clients and vehicle offers to resolve each row's labels (document + vehicle)
 * by id. Offers a client/state filter and a summary aside; rows link to the detail
 * and a header button starts a new quotation.
 */
@Component({
  selector: 'app-simulations-list',
  imports: [RouterLink, HlmButton, HlmInput, Breadcrumbs, MoneyPipe, AmountPipe, DatePipe],
  templateUrl: './simulations-list.html',
  styleUrl: './simulations-list.css',
})
export class SimulationsList implements OnInit {
  private readonly store = inject(CreditSimulationStore);
  private readonly clientsStore = inject(ClientsStore);
  private readonly offersStore = inject(VehicleOffersStore);

  protected readonly loading = this.store.loading;
  protected readonly isEmpty = this.store.isEmpty;
  protected readonly clients = this.clientsStore.clients;
  protected readonly states = Object.values(SimulationState);

  protected readonly clientFilter = signal('');
  protected readonly stateFilter = signal('');

  protected readonly breadcrumbs = [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Cotizaciones'},
  ];

  /** All simulations enriched with their client/offer, most recent first. */
  private readonly rows = computed<SimulationRow[]>(() => {
    const clients = this.clientsStore.clients();
    const offers = this.offersStore.offers();
    return this.store
      .simulations()
      .map(sim => ({
        sim,
        client: clients.find(c => c.id === sim.clientId) ?? null,
        offer: offers.find(o => o.id === sim.vehicleOfferId) ?? null,
      }))
      .sort((a, b) => (b.sim.createdAt?.getTime() ?? 0) - (a.sim.createdAt?.getTime() ?? 0));
  });

  /** Rows after applying the client and state filters. */
  protected readonly filteredRows = computed<SimulationRow[]>(() => {
    const client = this.clientFilter();
    const state = this.stateFilter();
    return this.rows().filter(
      row =>
        (client === '' || row.sim.clientId === client) &&
        (state === '' || row.sim.state === state),
    );
  });

  protected readonly total = computed(() => this.filteredRows().length);

  /** Count per state over the filtered rows, in lifecycle order. */
  protected readonly byState = computed(() =>
    this.states
      .map(state => ({
        state,
        count: this.filteredRows().filter(row => row.sim.state === state).length,
      }))
      .filter(row => row.count > 0),
  );

  /** Total financed (loan amount) grouped by currency over the filtered rows. */
  protected readonly financedByCurrency = computed(() => {
    const totals = new Map<string, number>();
    for (const {sim} of this.filteredRows()) {
      const currency = sim.salePrice.currency;
      totals.set(currency, (totals.get(currency) ?? 0) + sim.loanAmount.amount);
    }
    return [...totals.entries()].map(([currency, total]) => ({currency, total}));
  });

  ngOnInit(): void {
    this.store.loadAll();
    this.clientsStore.load();
    this.offersStore.load();
  }

  /** Reads the selected value of a native <select> change event. */
  protected pick(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
