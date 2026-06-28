import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {Currency} from '../../shared/domain/model/currency';
import {Money} from '../../shared/domain/model/money';
import {ApiError} from '../../shared/infrastructure/api-error';
import {Capitalization} from '../domain/model/capitalization';
import {CreditSimulation} from '../domain/model/credit-simulation.entity';
import {Indicators} from '../domain/model/indicators.value-object';
import {Percentage} from '../domain/model/percentage.value-object';
import {Rate} from '../domain/model/rate.value-object';
import {RateType} from '../domain/model/rate-type';
import {SimulationDraft} from '../domain/model/simulation-draft.command';
import {SimulationState} from '../domain/model/simulation-state';
import {SimulationSummary} from '../domain/model/simulation-summary.value-object';
import {Term} from '../domain/model/term.value-object';
import {CreditSimulationsApi} from '../infrastructure/credit-simulations-api';
import {CreditSimulationStore} from './credit-simulation.store';

function makeSimulation(id = 's-1'): CreditSimulation {
  const pen = (amount: number) => new Money({amount, currency: Currency.PEN});
  return new CreditSimulation({
    id,
    clientId: 'cl-1',
    vehicleOfferId: 'vo-1',
    salePrice: pen(16000),
    rate: new Rate({value: 0.15, type: RateType.NOMINAL, capitalization: Capitalization.DAILY}),
    initialPercentage: new Percentage({value: 0.2}),
    balloonPercentage: new Percentage({value: 0.4}),
    term: new Term({numberOfInstallments: 36, frequencyDays: 30, installmentsPerYear: 12, daysPerYear: 360}),
    grace: [],
    costs: [],
    costOfCapital: new Rate({value: 0.5, type: RateType.EFFECTIVE, capitalization: null}),
    loanAmount: pen(12975),
    financedBalance: pen(9015.99),
    indicators: new Indicators({
      npv: 4436.18,
      periodicIrr: 0.0158,
      tcea: 0.2078,
      effectiveAnnualRate: 0.1618,
      periodicRate: 0.0126,
      periodicCostOfCapital: 0.0344,
    }),
    schedule: [],
    summary: new SimulationSummary({
      totalInterest: 2264.74,
      totalAmortization: 12975,
      totalLoanInstallments: 13650,
      totalToPay: 20000,
      totalsPerCost: [],
    }),
    state: SimulationState.GENERATED,
  });
}

function makeDraft(): SimulationDraft {
  return new SimulationDraft({
    clientId: 'cl-1',
    vehicleOfferId: 'vo-1',
    rateValue: 0.15,
    rateType: RateType.NOMINAL,
    capitalization: Capitalization.DAILY,
    initialPercentage: 0.2,
    balloonPercentage: 0.4,
    numberOfInstallments: 36,
    frequencyDays: 30,
    daysPerYear: 360,
    gracePlan: [],
    costs: [],
    costOfCapitalAnnual: 0.5,
  });
}

describe('CreditSimulationStore', () => {
  let api: {
    generate: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    listByClient: ReturnType<typeof vi.fn>;
  };

  function createStore(): CreditSimulationStore {
    TestBed.configureTestingModule({
      providers: [CreditSimulationStore, {provide: CreditSimulationsApi, useValue: api}],
    });
    return TestBed.inject(CreditSimulationStore);
  }

  beforeEach(() => {
    api = {generate: vi.fn(), getById: vi.fn(), listByClient: vi.fn()};
  });

  it('generate success holds the result in selected and flips generated', () => {
    api.generate.mockReturnValue(of(makeSimulation()));
    const store = createStore();
    store.generate(makeDraft());
    expect(store.selected()?.id).toBe('s-1');
    expect(store.generated()).toBe(true);
    expect(store.generating()).toBe(false);
  });

  it('generate failure sets error and does not flip generated', () => {
    const error = new ApiError({status: 400, code: 'INVALID_SIMULATION_CONFIGURATION'});
    api.generate.mockReturnValue(throwError(() => error));
    const store = createStore();
    store.generate(makeDraft());
    expect(store.error()).toBe(error);
    expect(store.generated()).toBe(false);
    expect(store.generating()).toBe(false);
  });

  it('loadOne sets the selected simulation', () => {
    api.getById.mockReturnValue(of(makeSimulation('s-9')));
    const store = createStore();
    store.loadOne('s-9');
    expect(store.selected()?.id).toBe('s-9');
  });

  it('loadHistory populates the client history', () => {
    api.listByClient.mockReturnValue(of([makeSimulation('s-1'), makeSimulation('s-2')]));
    const store = createStore();
    store.loadHistory('cl-1');
    expect(api.listByClient).toHaveBeenCalledWith('cl-1');
    expect(store.history()).toHaveLength(2);
    expect(store.isHistoryEmpty()).toBe(false);
  });

  it('isHistoryEmpty is true after an empty load', () => {
    api.listByClient.mockReturnValue(of([]));
    const store = createStore();
    store.loadHistory('cl-1');
    expect(store.isHistoryEmpty()).toBe(true);
  });
});
