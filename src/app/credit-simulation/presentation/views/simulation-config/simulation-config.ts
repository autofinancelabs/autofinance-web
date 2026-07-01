import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {applyEach, form, FormField, min, required, submit, validate} from '@angular/forms/signals';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmLabel} from '@spartan-ng/helm/label';
import {HlmError, HlmFormField} from '@spartan-ng/helm/form-field';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {VehicleOffersStore} from '../../../../vehicle-offers/application/vehicle-offers.store';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';
import {SimulationDraft} from '../../../domain/model/simulation-draft.command';
import {
  capitalizationLabel,
  capitalizationPresets,
  ratePeriodPresets,
} from '../../../domain/model/capitalization';
import {Cost} from '../../../domain/model/cost.value-object';
import {CostBasis, costBases} from '../../../domain/model/cost-basis';
import {CostTiming, costTimings} from '../../../domain/model/cost-timing';
import {GraceType} from '../../../domain/model/grace-type';
import {RateType, rateTypes} from '../../../domain/model/rate-type';

interface CostRow {
  name: string;
  value: number | null;
  basis: CostBasis;
  timing: CostTiming;
  embedded: boolean;
}

interface ConfigModel {
  clientId: string;
  vehicleOfferId: string;
  rateType: RateType;
  rateValue: number | null;
  /** Capitalization select (nominal only): '' (none), a preset's days as string, or 'OTHER'. */
  capitalizationChoice: string;
  /** Custom capitalization in days (used only when capitalizationChoice === 'OTHER'). */
  capitalizationDays: number | null;
  /** Rate-period select (both types): '' (annual), a preset's days as string, or 'OTHER'. */
  ratePeriodChoice: string;
  /** Custom rate period in days (used only when ratePeriodChoice === 'OTHER'). */
  ratePeriodDays: number | null;
  initialPercentage: number | null;
  balloonPercentage: number | null;
  costOfCapitalAnnual: number | null;
  numberOfInstallments: number | null;
  frequencyDays: number | null;
  daysPerYear: number | null;
  totalGrace: number;
  partialGrace: number;
  costs: CostRow[];
}

/**
 * Configures a credit simulation and generates it (the backend computes the
 * schedule + indicators). Two panes: the form, and a live configuration summary.
 * Rates/percentages are entered as numbers (20 = 20%) and converted to fractions
 * on submit. Grace is entered compactly as counts of total/partial periods.
 */
@Component({
  selector: 'app-simulation-config',
  imports: [FormField, RouterLink, HlmInput, HlmLabel, HlmError, HlmFormField, HlmButton, MoneyPipe, Breadcrumbs],
  templateUrl: './simulation-config.html',
  styleUrl: './simulation-config.css',
})
export class SimulationConfig extends BaseForm implements OnInit {
  private readonly store = inject(CreditSimulationStore);
  private readonly clientsStore = inject(ClientsStore);
  private readonly offersStore = inject(VehicleOffersStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly clients = this.clientsStore.clients;
  protected readonly offers = this.offersStore.offers;
  protected readonly generating = this.store.generating;

  protected readonly rateTypes = rateTypes;
  protected readonly capitalizationPresets = capitalizationPresets;
  protected readonly ratePeriodPresets = ratePeriodPresets;
  protected readonly costBases = costBases;
  protected readonly costTimings = costTimings;
  protected readonly RateType = RateType;
  protected readonly CostBasis = CostBasis;

  protected readonly costBasisLabels: Record<string, string> = {
    FIXED: 'Monto fijo',
    ON_BALANCE: '% sobre saldo',
    ON_SALE_PRICE: '% sobre precio',
  };
  protected readonly costTimingLabels: Record<string, string> = {
    INITIAL: 'Inicial',
    PERIODIC: 'Periódico',
  };

  protected readonly breadcrumbs = [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Cotizaciones', link: '/credit-simulations'},
    {label: 'Nueva cotización'},
  ];

  protected readonly model = signal<ConfigModel>({
    clientId: '',
    vehicleOfferId: '',
    rateType: RateType.NOMINAL,
    rateValue: null,
    capitalizationChoice: '',
    capitalizationDays: null,
    ratePeriodChoice: '',
    ratePeriodDays: null,
    initialPercentage: null,
    balloonPercentage: null,
    costOfCapitalAnnual: null,
    numberOfInstallments: null,
    frequencyDays: 30,
    daysPerYear: 360,
    totalGrace: 0,
    partialGrace: 0,
    costs: [],
  });

  protected readonly f = form(this.model, path => {
    required(path.clientId, {message: this.messageFor('cliente', 'required')});
    required(path.vehicleOfferId, {message: this.messageFor('oferta', 'required')});
    required(path.rateType, {message: this.messageFor('tipo de tasa', 'required')});
    required(path.rateValue, {message: this.messageFor('tasa', 'required')});
    min(path.rateValue, 0, {message: 'La tasa no puede ser negativa.'});
    required(path.numberOfInstallments, {message: this.messageFor('plazo', 'required')});
    min(path.numberOfInstallments, 1, {message: 'El plazo debe ser al menos 1 cuota.'});
    required(path.frequencyDays, {message: this.messageFor('frecuencia', 'required')});
    min(path.frequencyDays, 1, {message: 'La frecuencia debe ser mayor que 0.'});
    required(path.daysPerYear, {message: this.messageFor('días por año', 'required')});
    min(path.daysPerYear, 1, {message: 'Los días por año deben ser mayores que 0.'});
    required(path.initialPercentage, {message: this.messageFor('% de cuota inicial', 'required')});
    min(path.initialPercentage, 0, {message: 'El porcentaje no puede ser negativo.'});
    required(path.balloonPercentage, {message: this.messageFor('% de cuotón', 'required')});
    min(path.balloonPercentage, 0, {message: 'El porcentaje no puede ser negativo.'});
    required(path.costOfCapitalAnnual, {message: this.messageFor('COK anual', 'required')});
    min(path.costOfCapitalAnnual, 0, {message: 'El COK no puede ser negativo.'});
    min(path.totalGrace, 0, {message: 'No puede ser negativo.'});
    min(path.partialGrace, 0, {message: 'No puede ser negativo.'});

    // Capitalization is required only for a nominal rate.
    validate(path.capitalizationChoice, ctx => {
      const rateType = ctx.valueOf(path.rateType);
      if (rateType === RateType.NOMINAL && ctx.value() === '') {
        return {kind: 'required', message: 'Indica la capitalización para una tasa nominal.'};
      }
      return undefined;
    });
    // Custom capitalization days are required (and > 0) when "Otro" is chosen.
    validate(path.capitalizationDays, ctx => {
      if (ctx.valueOf(path.capitalizationChoice) === 'OTHER') {
        const days = ctx.value();
        if (days === null || days <= 0) {
          return {kind: 'min', message: 'Indica los días de capitalización (mayor que 0).'};
        }
      }
      return undefined;
    });
    // Custom rate-period days are required (and > 0) when "Otro" is chosen (both types).
    validate(path.ratePeriodDays, ctx => {
      if (ctx.valueOf(path.ratePeriodChoice) === 'OTHER') {
        const days = ctx.value();
        if (days === null || days <= 0) {
          return {kind: 'min', message: 'Indica los días del período (mayor que 0).'};
        }
      }
      return undefined;
    });

    // initial % + balloon % must be below 100.
    validate(path.balloonPercentage, ctx => {
      const initial = ctx.valueOf(path.initialPercentage) ?? 0;
      const balloon = ctx.value() ?? 0;
      if (initial + balloon >= 100) {
        return {kind: 'max', message: 'La suma de % inicial y % cuotón debe ser menor a 100.'};
      }
      return undefined;
    });

    // Grace periods must be fewer than the number of installments.
    validate(path.partialGrace, ctx => {
      const total = ctx.valueOf(path.totalGrace) ?? 0;
      const partial = ctx.value() ?? 0;
      const installments = ctx.valueOf(path.numberOfInstallments) ?? 0;
      if (installments > 0 && total + partial >= installments) {
        return {kind: 'max', message: 'Los periodos de gracia deben ser menos que el plazo.'};
      }
      return undefined;
    });

    applyEach(path.costs, cost => {
      required(cost.name, {message: 'Indica el nombre del costo.'});
      required(cost.value, {message: 'Indica el valor del costo.'});
      min(cost.value, 0, {message: 'El valor no puede ser negativo.'});
    });
  });

  /** Whether the custom "días de capitalización" input should be shown. */
  protected readonly showCustomCapitalization = computed(
    () => this.model().capitalizationChoice === 'OTHER',
  );

  /** Whether the custom "días del período" input should be shown. */
  protected readonly showCustomRatePeriod = computed(
    () => this.model().ratePeriodChoice === 'OTHER',
  );

  /** Human recap of the rate period ("Anual", a preset label, or "N días"). */
  protected readonly ratePeriodSummary = computed(() =>
    this.periodText(this.model().ratePeriodChoice, this.model().ratePeriodDays, 'Anual'),
  );

  /** Human recap of the nominal capitalization ("—", a preset label, or "N días"). */
  protected readonly capitalizationSummary = computed(() =>
    this.periodText(this.model().capitalizationChoice, this.model().capitalizationDays, '—'),
  );

  /** The picked offer (for the summary aside). */
  protected readonly selectedOffer = computed(() =>
    this.offers().find(offer => offer.id === this.model().vehicleOfferId) ?? null,
  );
  /** The picked client (for the summary aside). */
  protected readonly selectedClient = computed(() =>
    this.clients().find(client => client.id === this.model().clientId) ?? null,
  );

  constructor() {
    super();
    effect(() => {
      if (this.store.generated()) {
        const id = this.store.selected()?.id;
        if (id) {
          void this.router.navigate(['/credit-simulations', id]);
        }
      }
    });
  }

  ngOnInit(): void {
    this.store.resetWriteState();
    this.clientsStore.load();
    this.offersStore.load();
    // Preselect the client when arriving from the client's history ("Nueva cotización").
    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    if (clientId) {
      this.model.update(model => ({...model, clientId}));
    }
  }

  /** Renders a period choice ('' → emptyLabel, 'OTHER'/preset → label or "N días"). */
  private periodText(choice: string, days: number | null, emptyLabel: string): string {
    if (choice === '') {
      return emptyLabel;
    }
    const value = choice === 'OTHER' ? days : Number(choice);
    if (value === null) {
      return '—';
    }
    return capitalizationLabel(value) ?? `${value} días`;
  }

  protected addCost(): void {
    this.model.update(model => ({
      ...model,
      costs: [
        ...model.costs,
        {name: '', value: null, basis: CostBasis.FIXED, timing: CostTiming.PERIODIC, embedded: false},
      ],
    }));
  }

  protected removeCost(index: number): void {
    this.model.update(model => ({
      ...model,
      costs: model.costs.filter((_, i) => i !== index),
    }));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.f, async () => {
      const value = this.model();
      const installments = value.numberOfInstallments ?? 0;
      const total = value.totalGrace ?? 0;
      const partial = value.partialGrace ?? 0;
      const gracePlan: GraceType[] = [
        ...Array<GraceType>(total).fill(GraceType.TOTAL),
        ...Array<GraceType>(partial).fill(GraceType.PARTIAL),
        ...Array<GraceType>(Math.max(0, installments - total - partial)).fill(GraceType.NONE),
      ];
      // Capitalization applies only to nominal rates (required there).
      const capitalization =
        value.rateType !== RateType.NOMINAL || value.capitalizationChoice === ''
          ? null
          : value.capitalizationChoice === 'OTHER'
            ? value.capitalizationDays
            : Number(value.capitalizationChoice);
      // Rate period applies to both types; '' = annual (null).
      const ratePeriod =
        value.ratePeriodChoice === ''
          ? null
          : value.ratePeriodChoice === 'OTHER'
            ? value.ratePeriodDays
            : Number(value.ratePeriodChoice);
      const draft = new SimulationDraft({
        clientId: value.clientId,
        vehicleOfferId: value.vehicleOfferId,
        rateValue: (value.rateValue ?? 0) / 100,
        rateType: value.rateType,
        capitalization,
        ratePeriod,
        initialPercentage: (value.initialPercentage ?? 0) / 100,
        balloonPercentage: (value.balloonPercentage ?? 0) / 100,
        numberOfInstallments: installments,
        frequencyDays: value.frequencyDays ?? 30,
        daysPerYear: value.daysPerYear ?? 360,
        gracePlan,
        costs: value.costs.map(
          cost =>
            new Cost({
              name: cost.name,
              value: cost.value ?? 0,
              basis: cost.basis,
              timing: cost.timing,
              embedded: cost.embedded,
            }),
        ),
        costOfCapitalAnnual: (value.costOfCapitalAnnual ?? 0) / 100,
      });
      this.store.generate(draft);
      return undefined;
    });
  }
}
