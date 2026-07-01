import {DatePipe} from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmTooltipImports} from '@spartan-ng/helm/tooltip';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {AmountPipe} from '../../../../shared/presentation/amount.pipe';
import {RatePipe} from '../../../../shared/presentation/rate.pipe';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';

/**
 * A client's credit-simulation history (read model): lists the quotes generated for
 * one client and links to each result, with a shortcut to start a new one for the
 * same client. Reached from the Clients list.
 */
@Component({
  selector: 'app-simulation-history',
  imports: [RouterLink, HlmButton, HlmTooltipImports, Breadcrumbs, MoneyPipe, AmountPipe, RatePipe, DatePipe],
  templateUrl: './simulation-history.html',
  styleUrl: './simulation-history.css',
})
export class SimulationHistory implements OnInit {
  private readonly store = inject(CreditSimulationStore);
  private readonly clientsStore = inject(ClientsStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly clientId = this.route.snapshot.paramMap.get('clientId') ?? '';
  protected readonly history = this.store.history;
  protected readonly loading = this.store.loading;
  protected readonly isEmpty = this.store.isHistoryEmpty;
  protected readonly client = this.clientsStore.selected;

  protected readonly breadcrumbs = [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Clientes', link: '/clients'},
    {label: 'Cotizaciones'},
  ];

  ngOnInit(): void {
    this.store.loadHistory(this.clientId);
    this.clientsStore.loadOne(this.clientId);
  }
}
