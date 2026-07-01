import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {VehicleOffersStore} from '../../../../vehicle-offers/application/vehicle-offers.store';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';
import {GraceType} from '../../../domain/model/grace-type';
import {RateType} from '../../../domain/model/rate-type';
import {SimulationDraft} from '../../../domain/model/simulation-draft.command';
import {SimulationConfig} from './simulation-config';

const flush = () => new Promise(resolve => setTimeout(resolve));

interface FormModel {
  clientId: string;
  vehicleOfferId: string;
  rateType: RateType;
  rateValue: number | null;
  capitalizationChoice: string;
  capitalizationDays: number | null;
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
  let selected: WritableSignal<{id: string} | null>;
  let store: {generate: ReturnType<typeof vi.fn>; resetWriteState: ReturnType<typeof vi.fn>};
  let router: {navigate: ReturnType<typeof vi.fn>};

  function setup(): ComponentFixture<SimulationConfig> {
    generating = signal(false);
    generated = signal(false);
    selected = signal<{id: string} | null>(null);
    store = {generate: vi.fn(), resetWriteState: vi.fn(), generating, generated, selected} as never;
    router = {navigate: vi.fn()};

    TestBed.configureTestingModule({
      imports: [SimulationConfig],
      providers: [
        {provide: CreditSimulationStore, useValue: store},
        {provide: ClientsStore, useValue: {clients: signal([]), load: vi.fn()}},
        {provide: VehicleOffersStore, useValue: {offers: signal([]), load: vi.fn()}},
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: convertToParamMap({})}}},
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

  it('navigates to the result once generated', () => {
    const fixture = setup();
    selected.set({id: 's-1'});
    generated.set(true);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/credit-simulations', 's-1']);
  });
});
