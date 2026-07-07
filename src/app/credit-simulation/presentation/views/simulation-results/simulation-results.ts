import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {Money} from '../../../../shared/domain/model/money';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {AmountPipe} from '../../../../shared/presentation/amount.pipe';
import {RatePipe} from '../../../../shared/presentation/rate.pipe';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';
import {GraceType} from '../../../domain/model/grace-type';
import {ScheduleRow} from '../../../domain/model/schedule-row.value-object';

/**
 * Renders a generated/loaded simulation: the SBS transparency indicators (VAN,
 * TIR, TCEA + rate echo), a totals strip, the dense payment schedule (with the
 * balloon-settlement row accented), the applied configuration and the client's
 * simulation history.
 */
@Component({
  selector: 'app-simulation-results',
  imports: [RouterLink, HlmButton, Breadcrumbs, MoneyPipe, AmountPipe, RatePipe],
  templateUrl: './simulation-results.html',
  styleUrl: './simulation-results.css',
})
export class SimulationResults implements OnInit {
  private readonly store = inject(CreditSimulationStore);
  private readonly route = inject(ActivatedRoute);

  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  private loadedHistoryFor: string | null = null;

  protected readonly simulation = this.store.selected;
  protected readonly loading = this.store.loading;
  protected readonly history = this.store.history;

  protected readonly graceLabels: Record<GraceType, string> = {
    [GraceType.NONE]: 'S',
    [GraceType.TOTAL]: 'T',
    [GraceType.PARTIAL]: 'P',
  };

  protected readonly breadcrumbs = [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Cotizaciones', link: '/credit-simulations'},
    {label: 'Resultado'},
  ];

  /** Costs breakdown accordion: open by default on desktop, collapsed on mobile. */
  protected readonly costsOpen = signal(this.isDesktop());

  /** Per-cost schedule columns: the distinct applied-cost names, in first-seen order. */
  protected readonly costColumns = computed<string[]>(() => {
    const names: string[] = [];
    for (const row of this.simulation()?.schedule ?? []) {
      for (const cost of row.appliedCosts) {
        if (!names.includes(cost.name)) {
          names.push(cost.name);
        }
      }
    }
    return names;
  });

  /** VAN as Money (in the operation's currency) for the indicator chip. */
  protected readonly van = computed(() => {
    const sim = this.simulation();
    return sim ? new Money({amount: sim.indicators.npv, currency: sim.salePrice.currency}) : null;
  });
  protected readonly vanPositive = computed(() => (this.simulation()?.indicators.npv ?? 0) >= 0);

  /** Prominent summary totals as Money (the wire sends them as plain numbers). */
  protected readonly totalToPay = computed(() => {
    const sim = this.simulation();
    return sim
      ? new Money({amount: sim.summary.totalToPay, currency: sim.salePrice.currency})
      : null;
  });
  protected readonly totalInterest = computed(() => {
    const sim = this.simulation();
    return sim
      ? new Money({amount: sim.summary.totalInterest, currency: sim.salePrice.currency})
      : null;
  });

  /** History of other simulations for the same client (excludes the current one). */
  protected readonly clientHistory = computed(() =>
    this.history().filter(sim => sim.id !== this.simulation()?.id),
  );

  constructor() {
    // Once a simulation is available, load its client's history (once per client).
    effect(() => {
      const sim = this.simulation();
      if (sim && this.loadedHistoryFor !== sim.clientId) {
        this.loadedHistoryFor = sim.clientId;
        this.store.loadHistory(sim.clientId);
      }
    });
  }

  ngOnInit(): void {
    if (this.store.selected()?.id !== this.id) {
      this.store.loadOne(this.id);
    }
  }

  /** The balloon-settlement row sits beyond the regular installments. */
  protected isSettlement(period: number): boolean {
    const installments = this.simulation()?.term.numberOfInstallments ?? 0;
    return period > installments;
  }

  protected displayOpeningBalance(row: ScheduleRow): number {
    return this.isSettlement(row.period) ? row.openingBalanceBalloon : row.openingBalance;
  }

  protected displayInterest(row: ScheduleRow): number {
    return this.isSettlement(row.period) ? row.interestBalloon : row.interest;
  }

  protected displayInstallment(row: ScheduleRow): number {
    return this.isSettlement(row.period) ? this.balloonSettlementAmount(row) : row.installment;
  }

  protected displayAmortization(row: ScheduleRow): number {
    return this.isSettlement(row.period) ? this.balloonSettlementAmount(row) : row.amortization;
  }

  protected displayCost(row: ScheduleRow, name: string): number {
    if (this.isSettlement(row.period) && this.isCreditLifeInsuranceCost(name)) {
      return row.balloonCreditLifeInsurance;
    }
    return row.costNamed(name);
  }

  protected displayClosingBalance(row: ScheduleRow): number {
    return this.isSettlement(row.period) ? row.closingBalanceBalloon : row.closingBalance;
  }

  /** Keeps the accordion signal in sync when the user expands/collapses it. */
  protected onCostsToggle(event: Event): void {
    this.costsOpen.set((event.target as HTMLDetailsElement).open);
  }

  private balloonSettlementAmount(row: ScheduleRow): number {
    return row.openingBalanceBalloon + row.interestBalloon + row.balloonCreditLifeInsurance;
  }

  private isCreditLifeInsuranceCost(name: string): boolean {
    const normalized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return normalized.includes('desgrav') || normalized.includes('segdes');
  }

  /** Viewport ≥ 768px (desktop). Falls back to open when matchMedia is unavailable (tests). */
  private isDesktop(): boolean {
    try {
      return window.matchMedia('(min-width: 768px)').matches;
    } catch {
      return true;
    }
  }
}
