import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {CreditSimulation} from '../../../domain/model/credit-simulation.entity';
import {SimulationAssembler} from '../../../infrastructure/simulation-assembler';
import {SimulationResource} from '../../../infrastructure/simulation-response';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';
import {SimulationResults} from './simulation-results';

const assembler = new SimulationAssembler();

function scheduleRow(period: number, graceType: string, settlement = false): SimulationResource['schedule'][number] {
  return {
    period,
    graceType,
    openingBalanceBalloon: 0,
    interestBalloon: 0,
    balloonCreditLifeInsurance: 0,
    closingBalanceBalloon: 0,
    openingBalance: settlement ? 0 : 1000,
    interest: settlement ? 0 : 50,
    installment: settlement ? 0 : 400,
    amortization: settlement ? 0 : 350,
    closingBalance: settlement ? 0 : 650,
    cashFlow: settlement ? 6400 : 410,
    appliedCosts: [],
  };
}

function makeSim(id: string, npv: number, clientId = 'cl-1'): CreditSimulation {
  const resource: SimulationResource = {
    id,
    clientId,
    vehicleOfferId: 'vo-1',
    salePrice: {amount: 16000, currency: 'PEN'},
    rate: {value: 0.15, type: 'NOMINAL', capitalization: 1, ratePeriod: null},
    initialPercentage: 0.2,
    balloonPercentage: 0.4,
    term: {numberOfInstallments: 2, frequencyDays: 30, installmentsPerYear: 12, daysPerYear: 360},
    grace: ['NONE', 'NONE'],
    costs: [],
    costOfCapital: {value: 0.5, type: 'EFFECTIVE', capitalization: null, ratePeriod: null},
    loanAmount: {amount: 12975, currency: 'PEN'},
    financedBalance: {amount: 9015.99, currency: 'PEN'},
    indicators: {
      npv,
      periodicIrr: 0.0158,
      tcea: 0.2078,
      effectiveAnnualRate: 0.1618,
      periodicRate: 0.0126,
      periodicCostOfCapital: 0.0344,
    },
    schedule: [scheduleRow(1, 'NONE'), scheduleRow(2, 'NONE'), scheduleRow(3, 'NONE', true)],
    summary: {
      totalInterest: 2264.74,
      totalAmortization: 12975,
      totalLoanInstallments: 13650,
      totalToPay: 20000,
      totalsPerCost: {},
    },
    state: 'GENERATED',
  };
  return assembler.toEntityFromResource(resource);
}

describe('SimulationResults', () => {
  let selected: WritableSignal<CreditSimulation | null>;
  let loading: WritableSignal<boolean>;
  let history: WritableSignal<CreditSimulation[]>;
  let store: {loadOne: ReturnType<typeof vi.fn>; loadHistory: ReturnType<typeof vi.fn>};

  function setup(routeId: string, sim: CreditSimulation | null): ComponentFixture<SimulationResults> {
    selected = signal<CreditSimulation | null>(sim);
    loading = signal(false);
    history = signal<CreditSimulation[]>([]);
    store = {loadOne: vi.fn(), loadHistory: vi.fn(), selected, loading, history} as never;

    TestBed.configureTestingModule({
      imports: [SimulationResults],
      providers: [
        provideRouter([]),
        {provide: CreditSimulationStore, useValue: store},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: convertToParamMap({id: routeId})}}},
      ],
    });
    const fixture = TestBed.createComponent(SimulationResults);
    fixture.detectChanges();
    return fixture;
  }

  it('loads the simulation by id when the selected one does not match', () => {
    setup('s-9', null);
    expect(store.loadOne).toHaveBeenCalledWith('s-9');
  });

  it('does not reload when the selected simulation already matches', () => {
    setup('s-1', makeSim('s-1', 4436.18));
    expect(store.loadOne).not.toHaveBeenCalled();
  });

  it('loads the client history once a simulation is available', () => {
    setup('s-1', makeSim('s-1', 4436.18));
    expect(store.loadHistory).toHaveBeenCalledWith('cl-1');
  });

  it('renders a positive VAN chip and the schedule with the settlement row', () => {
    const fixture = setup('s-1', makeSim('s-1', 4436.18));
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chip--positive')).not.toBeNull();
    expect(el.textContent).toContain('VAN');
    expect(el.textContent).toContain('TCEA');
    // settlement row (period 3 > 2 installments) is flagged
    expect(el.querySelector('.row--settlement')).not.toBeNull();
    expect(el.textContent).toContain('Cuotón');
  });

  it('renders a negative VAN chip when npv < 0', () => {
    const fixture = setup('s-1', makeSim('s-1', -9420.7));
    expect((fixture.nativeElement as HTMLElement).querySelector('.chip--negative')).not.toBeNull();
  });

  it('lists other simulations of the client in the history (excluding the current)', () => {
    const fixture = setup('s-1', makeSim('s-1', 4436.18));
    history.set([makeSim('s-1', 4436.18), makeSim('s-2', 100)]);
    fixture.detectChanges();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.history-item');
    expect(links).toHaveLength(1);
  });
});
