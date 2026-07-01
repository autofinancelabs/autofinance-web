import {Component, computed, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {AuthStore} from '../../../../iam/application/auth.store';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {VehicleOffersStore} from '../../../../vehicle-offers/application/vehicle-offers.store';
import {CreditSimulationStore} from '../../../../credit-simulation/application/credit-simulation.store';
import {Client} from '../../../../clients/domain/model/client.entity';
import {VehicleOffer} from '../../../../vehicle-offers/domain/model/vehicle-offer.entity';
import {CreditSimulation} from '../../../../credit-simulation/domain/model/credit-simulation.entity';
import {Currency} from '../../../domain/model/currency';
import {Money} from '../../../domain/model/money';
import {MoneyPipe} from '../../money.pipe';
import {AmountPipe} from '../../amount.pipe';

interface RecentRow {
  sim: CreditSimulation;
  client: Client | null;
  offer: VehicleOffer | null;
}

/**
 * Landing view of the authenticated app: a hero greeting with the primary action,
 * a strip of live KPIs (clients, offers, quotations, financed amount), quick-access
 * cards to each area, and the most recent quotations. Data comes from the context
 * stores, loaded on init.
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, HlmButton, MoneyPipe, AmountPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly clientsStore = inject(ClientsStore);
  private readonly offersStore = inject(VehicleOffersStore);
  private readonly simulationsStore = inject(CreditSimulationStore);

  protected readonly username = computed(() => this.authStore.currentUser()?.username ?? '');

  protected readonly clientsCount = computed(() => this.clientsStore.clients().length);
  protected readonly offersCount = computed(() => this.offersStore.offers().length);
  private readonly simulations = this.simulationsStore.simulations;
  protected readonly simsCount = computed(() => this.simulations().length);

  /** Total financed (loan amount), taken for the currency with the largest total. */
  protected readonly financed = computed<Money | null>(() => {
    const totals = new Map<string, number>();
    for (const sim of this.simulations()) {
      const currency = sim.salePrice.currency;
      totals.set(currency, (totals.get(currency) ?? 0) + sim.loanAmount.amount);
    }
    let best: {currency: string; total: number} | null = null;
    for (const [currency, total] of totals) {
      if (!best || total > best.total) {
        best = {currency, total};
      }
    }
    return best ? new Money({amount: best.total, currency: best.currency as Currency}) : null;
  });

  /** The five most recent quotations, enriched with their client and vehicle. */
  protected readonly recent = computed<RecentRow[]>(() => {
    const clients = this.clientsStore.clients();
    const offers = this.offersStore.offers();
    return [...this.simulations()]
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      .slice(0, 5)
      .map(sim => ({
        sim,
        client: clients.find(c => c.id === sim.clientId) ?? null,
        offer: offers.find(o => o.id === sim.vehicleOfferId) ?? null,
      }));
  });

  ngOnInit(): void {
    this.clientsStore.load();
    this.offersStore.load();
    this.simulationsStore.loadAll();
  }

  protected vehicleLabel(offer: VehicleOffer | null): string {
    return offer ? `${offer.year} ${offer.make} ${offer.model}` : '—';
  }
}
