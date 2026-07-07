import {DatePipe} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmTooltipImports} from '@spartan-ng/helm/tooltip';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {AmountPipe} from '../../../../shared/presentation/amount.pipe';
import {RatePipe} from '../../../../shared/presentation/rate.pipe';
import {Client} from '../../../../clients/domain/model/client.entity';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {VehicleOffer} from '../../../../vehicle-offers/domain/model/vehicle-offer.entity';
import {VehicleOffersStore} from '../../../../vehicle-offers/application/vehicle-offers.store';
import {CreditSimulation} from '../../../domain/model/credit-simulation.entity';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';

interface SimulationRow {
  sim: CreditSimulation;
  client: Client | null;
  offer: VehicleOffer | null;
}

/**
 * Tenant-wide list of the advisor's credit simulations. Loads all simulations plus
 * the clients and vehicle offers to resolve each row's labels (name + vehicle) by id.
 * Offers a client filter; rows show the SBS indicators (VAN/TCEA/TIR) and link to the
 * detail or the edit form, and a header button starts a new quotation.
 */
@Component({
  selector: 'app-simulations-list',
  imports: [RouterLink, HlmButton, HlmInput, HlmTooltipImports, Breadcrumbs, MoneyPipe, AmountPipe, RatePipe, DatePipe],
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

  protected readonly clientFilter = signal('');

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

  /** Rows after applying the client filter. */
  protected readonly filteredRows = computed<SimulationRow[]>(() => {
    const client = this.clientFilter();
    return this.rows().filter(row => client === '' || row.sim.clientId === client);
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
