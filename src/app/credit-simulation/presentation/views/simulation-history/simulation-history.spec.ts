import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {CreditSimulation} from '../../../domain/model/credit-simulation.entity';
import {SimulationAssembler} from '../../../infrastructure/simulation-assembler';
import {SimulationResource} from '../../../infrastructure/simulation-response';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';
import {SimulationHistory} from './simulation-history';

const assembler = new SimulationAssembler();

function makeSim(id: string, clientId = 'cl-1'): CreditSimulation {
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
      npv: 4436.18,
      periodicIrr: 0.0158,
      tcea: 0.2078,
      effectiveAnnualRate: 0.1618,
      periodicRate: 0.0126,
      periodicCostOfCapital: 0.0344,
    },
    schedule: [],
    summary: {
      totalInterest: 2264.74,
      totalAmortization: 12975,
      totalLoanInstallments: 13650,
      totalToPay: 20000,
      totalsPerCost: {},
    },
    state: 'GENERATED',
    createdAt: '2026-06-01T12:00:00Z',
  };
  return assembler.toEntityFromResource(resource);
}

interface DocClient {
  id: string;
  documentId: {type: string; number: string};
}

describe('SimulationHistory', () => {
  let history: WritableSignal<CreditSimulation[]>;
  let loading: WritableSignal<boolean>;
  let isHistoryEmpty: WritableSignal<boolean>;
  let selected: WritableSignal<DocClient | null>;
  let store: {loadHistory: ReturnType<typeof vi.fn>};
  let clientsStore: {loadOne: ReturnType<typeof vi.fn>};

  function setup(clientId: string): ComponentFixture<SimulationHistory> {
    history = signal<CreditSimulation[]>([]);
    loading = signal(false);
    isHistoryEmpty = signal(false);
    selected = signal<DocClient | null>(null);
    store = {loadHistory: vi.fn(), history, loading, isHistoryEmpty} as never;
    clientsStore = {loadOne: vi.fn(), selected} as never;

    TestBed.configureTestingModule({
      imports: [SimulationHistory],
      providers: [
        provideRouter([]),
        {provide: CreditSimulationStore, useValue: store},
        {provide: ClientsStore, useValue: clientsStore},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: convertToParamMap({clientId})}}},
      ],
    });
    const fixture = TestBed.createComponent(SimulationHistory);
    fixture.detectChanges();
    return fixture;
  }

  it('loads the history and the client on init', () => {
    setup('cl-1');
    expect(store.loadHistory).toHaveBeenCalledWith('cl-1');
    expect(clientsStore.loadOne).toHaveBeenCalledWith('cl-1');
  });

  it('renders each simulation with its state, loan amount and a link to the detail', () => {
    const fixture = setup('cl-1');
    history.set([makeSim('s-1'), makeSim('s-2')]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('.history-table tbody tr');
    expect(rows).toHaveLength(2);
    expect(el.textContent).toContain('GENERATED');
    const detailLink = el.querySelector<HTMLAnchorElement>('.history-table tbody a[href]');
    expect(detailLink?.getAttribute('href')).toContain('/credit-simulations/s-1');
  });

  it('shows the empty state with a CTA carrying the clientId when there is no history', () => {
    const fixture = setup('cl-1');
    isHistoryEmpty.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty')).not.toBeNull();
    const cta = el.querySelector<HTMLAnchorElement>('.empty a[href]');
    expect(cta?.getAttribute('href')).toContain('clientId=cl-1');
  });

  it('the "Nueva cotización" header button preselects the client via queryParams', () => {
    const fixture = setup('cl-1');
    const el = fixture.nativeElement as HTMLElement;
    const cta = el.querySelector<HTMLAnchorElement>('.page-header a[href]');
    expect(cta?.getAttribute('href')).toContain('/credit-simulations/new');
    expect(cta?.getAttribute('href')).toContain('clientId=cl-1');
  });
});
