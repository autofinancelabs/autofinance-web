import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {VehicleOffersStore} from '../../../../vehicle-offers/application/vehicle-offers.store';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';
import {CreditSimulation} from '../../../domain/model/credit-simulation.entity';
import {GraceType} from '../../../domain/model/grace-type';
import {RateType} from '../../../domain/model/rate-type';
import {SimulationAssembler} from '../../../infrastructure/simulation-assembler';
import {SimulationResource} from '../../../infrastructure/simulation-response';
import {SimulationDraft} from '../../../domain/model/simulation-draft.command';
import {SimulationConfig} from './simulation-config';

/** A persisted simulation (nominal 15% daily, 30-day period, balloon 40%, 3T+3P grace) for edit tests. */
function makeSimEntity(): CreditSimulation {
  const resource: SimulationResource = {
    id: 's-1',
    clientId: 'cl-1',
    vehicleOfferId: 'vo-1',
    salePrice: {amount: 16000, currency: 'PEN'},
    rate: {value: 0.15, type: 'NOMINAL', capitalization: 1, ratePeriod: 30},
    initialPercentage: 0.2,
    balloonPercentage: 0.4,
    term: {numberOfInstallments: 36, frequencyDays: 30, installmentsPerYear: 12, daysPerYear: 360},
    grace: [
      ...Array<string>(3).fill('TOTAL'),
      ...Array<string>(3).fill('PARTIAL'),
      ...Array<string>(30).fill('NONE'),
    ],
    costs: [],
    costOfCapital: {value: 0.5, type: 'EFFECTIVE', capitalization: null, ratePeriod: null},
    loanAmount: {amount: 12975, currency: 'PEN'},
    financedBalance: {amount: 9015.99, currency: 'PEN'},
    indicators: {npv: 1, periodicIrr: 0.01, tcea: 0.2, effectiveAnnualRate: 0.16, periodicRate: 0.01, periodicCostOfCapital: 0.03},
    schedule: [],
    summary: {totalInterest: 0, totalAmortization: 0, totalLoanInstallments: 0, totalToPay: 0, totalsPerCost: {}},
    state: 'GENERATED',
    createdAt: '2026-06-01T12:00:00Z',
    updatedAt: '2026-06-01T12:00:00Z',
  };
  return new SimulationAssembler().toEntityFromResource(resource);
}

const flush = () => new Promise(resolve => setTimeout(resolve));

interface FormModel {
  clientId: string;
  vehicleOfferId: string;
  rateType: RateType;
  rateValue: number | null;
  capitalizationChoice: string;
  capitalizationDays: number | null;
  ratePeriodChoice: string;
  ratePeriodDays: number | null;
  initialPercentage: number | null;
  balloonPercentage: number | null;
  costOfCapitalAnnual: number | null;
  numberOfInstallments: number | null;
  frequencyDays: number | null;
  daysPerYear: number | null;
  totalGrace: number;
  partialGrace: number;
  costs: unknown[];
}

const validModel: FormModel = {
  clientId: 'cl-1',
  vehicleOfferId: 'vo-1',
  rateType: RateType.EFFECTIVE,
  rateValue: 9,
  capitalizationChoice: '',
  capitalizationDays: null,
  ratePeriodChoice: '',
  ratePeriodDays: null,
  initialPercentage: 20,
  balloonPercentage: 40,
  costOfCapitalAnnual: 50,
  numberOfInstallments: 36,
  frequencyDays: 30,
  daysPerYear: 360,
  totalGrace: 3,
  partialGrace: 3,
  costs: [],
};

describe('SimulationConfig', () => {
  let generating: WritableSignal<boolean>;
  let generated: WritableSignal<boolean>;
  let selected: WritableSignal<CreditSimulation | null>;
  let store: {
    generate: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    loadOne: ReturnType<typeof vi.fn>;
    resetWriteState: ReturnType<typeof vi.fn>;
  };
  let router: {navigate: ReturnType<typeof vi.fn>};

  function setup(
    queryParams: Record<string, string> = {},
    routeParams: Record<string, string> = {},
    selectedSim: CreditSimulation | null = null,
  ): ComponentFixture<SimulationConfig> {
    generating = signal(false);
    generated = signal(false);
    selected = signal<CreditSimulation | null>(selectedSim);
    store = {
      generate: vi.fn(),
      update: vi.fn(),
      loadOne: vi.fn(),
      resetWriteState: vi.fn(),
      generating,
      generated,
      selected,
    } as never;
    router = {navigate: vi.fn()};

    TestBed.configureTestingModule({
      imports: [SimulationConfig],
      providers: [
        {provide: CreditSimulationStore, useValue: store},
        {provide: ClientsStore, useValue: {clients: signal([]), load: vi.fn()}},
        {provide: VehicleOffersStore, useValue: {offers: signal([]), load: vi.fn()}},
        {provide: Router, useValue: router},
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(routeParams),
              queryParamMap: convertToParamMap(queryParams),
            },
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(SimulationConfig);
    fixture.detectChanges();
    return fixture;
  }

  function instance(fixture: ComponentFixture<SimulationConfig>) {
    return fixture.componentInstance as unknown as {
      model: WritableSignal<FormModel>;
      onSubmit: (e: Event) => void;
    };
  }

  it('builds a SimulationDraft with fractions, grace plan and null capitalization (effective)', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.generate).toHaveBeenCalledTimes(1);
    const draft = store.generate.mock.calls[0][0] as SimulationDraft;
    expect(draft).toBeInstanceOf(SimulationDraft);
    expect(draft.rateValue).toBeCloseTo(0.09, 10);
    expect(draft.initialPercentage).toBeCloseTo(0.2, 10);
    expect(draft.balloonPercentage).toBeCloseTo(0.4, 10);
    expect(draft.costOfCapitalAnnual).toBeCloseTo(0.5, 10);
    expect(draft.capitalization).toBeNull();
    expect(draft.ratePeriod).toBeNull();
    expect(draft.gracePlan).toHaveLength(36);
    expect(draft.gracePlan.slice(0, 3)).toEqual([GraceType.TOTAL, GraceType.TOTAL, GraceType.TOTAL]);
    expect(draft.gracePlan.slice(3, 6)).toEqual([
      GraceType.PARTIAL,
      GraceType.PARTIAL,
      GraceType.PARTIAL,
    ]);
    expect(draft.gracePlan[6]).toBe(GraceType.NONE);
  });

  it('sends the chosen capitalization preset (days) for a nominal rate', async () => {
    const fixture = setup();
    instance(fixture).model.set({
      ...validModel,
      rateType: RateType.NOMINAL,
      capitalizationChoice: '30',
    });
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.generate).toHaveBeenCalledTimes(1);
    const draft = store.generate.mock.calls[0][0] as SimulationDraft;
    expect(draft.capitalization).toBe(30);
    expect(draft.ratePeriod).toBeNull();
  });

  it('sends the nominal rate period alongside the capitalization', async () => {
    const fixture = setup();
    instance(fixture).model.set({
      ...validModel,
      rateType: RateType.NOMINAL,
      capitalizationChoice: '1',
      ratePeriodChoice: '30',
    });
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    const draft = store.generate.mock.calls[0][0] as SimulationDraft;
    expect(draft.capitalization).toBe(1);
    expect(draft.ratePeriod).toBe(30);
  });

  it('sends the custom capitalization days when "Otro" is chosen', async () => {
    const fixture = setup();
    instance(fixture).model.set({
      ...validModel,
      rateType: RateType.NOMINAL,
      capitalizationChoice: 'OTHER',
      capitalizationDays: 15,
    });
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.generate).toHaveBeenCalledTimes(1);
    const draft = store.generate.mock.calls[0][0] as SimulationDraft;
    expect(draft.capitalization).toBe(15);
  });

  it('sends the effective rate period (monthly) as days and no capitalization', async () => {
    const fixture = setup();
    instance(fixture).model.set({
      ...validModel,
      rateType: RateType.EFFECTIVE,
      ratePeriodChoice: '30',
    });
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    const draft = store.generate.mock.calls[0][0] as SimulationDraft;
    expect(draft.ratePeriod).toBe(30);
    expect(draft.capitalization).toBeNull();
  });

  it('sends a custom effective period (100 days) via "Otro"', async () => {
    const fixture = setup();
    instance(fixture).model.set({
      ...validModel,
      rateType: RateType.EFFECTIVE,
      ratePeriodChoice: 'OTHER',
      ratePeriodDays: 100,
    });
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    const draft = store.generate.mock.calls[0][0] as SimulationDraft;
    expect(draft.ratePeriod).toBe(100);
    expect(draft.capitalization).toBeNull();
  });

  it('blocks submit when a nominal rate has no capitalization', async () => {
    const fixture = setup();
    instance(fixture).model.set({
      ...validModel,
      rateType: RateType.NOMINAL,
      capitalizationChoice: '',
    });
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.generate).not.toHaveBeenCalled();
  });

  it('blocks submit when initial % + balloon % >= 100', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel, initialPercentage: 70, balloonPercentage: 40});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.generate).not.toHaveBeenCalled();
  });

  it('blocks submit when no client is selected', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel, clientId: ''});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.generate).not.toHaveBeenCalled();
  });

  it('preselects the client from the ?clientId query param', () => {
    const fixture = setup({clientId: 'cl-42'});
    expect(instance(fixture).model().clientId).toBe('cl-42');
  });

  it('navigates to the result once generated', () => {
    const fixture = setup();
    selected.set(makeSimEntity());
    generated.set(true);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/credit-simulations', 's-1']);
  });

  it('in edit mode loads the simulation, hydrates the form and submits via update()', async () => {
    const fixture = setup({}, {id: 's-1'}, makeSimEntity());
    fixture.detectChanges();
    const inst = instance(fixture);

    expect(store.loadOne).toHaveBeenCalledWith('s-1');
    // Hydrated from the loaded aggregate (fractions → percents, days → preset choices, grace → counts).
    expect(inst.model().clientId).toBe('cl-1');
    expect(inst.model().rateValue).toBeCloseTo(15, 6);
    expect(inst.model().rateType).toBe(RateType.NOMINAL);
    expect(inst.model().capitalizationChoice).toBe('1');
    expect(inst.model().ratePeriodChoice).toBe('30');
    expect(inst.model().initialPercentage).toBeCloseTo(20, 6);
    expect(inst.model().balloonPercentage).toBeCloseTo(40, 6);
    expect(inst.model().totalGrace).toBe(3);
    expect(inst.model().partialGrace).toBe(3);

    inst.onSubmit(new Event('submit'));
    await flush();

    expect(store.update).toHaveBeenCalledTimes(1);
    expect(store.update.mock.calls[0][0]).toBe('s-1');
    expect(store.generate).not.toHaveBeenCalled();
  });
});
