import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Client} from '../../../../clients/domain/model/client.entity';
import {ContactInfo} from '../../../../clients/domain/model/contact-info.value-object';
import {DocumentId} from '../../../../clients/domain/model/document-id.value-object';
import {DocumentType} from '../../../../clients/domain/model/document-type';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {Currency} from '../../../../shared/domain/model/currency';
import {Money} from '../../../../shared/domain/model/money';
import {VehicleOffer} from '../../../../vehicle-offers/domain/model/vehicle-offer.entity';
import {VehicleOffersStore} from '../../../../vehicle-offers/application/vehicle-offers.store';
import {CreditSimulation} from '../../../domain/model/credit-simulation.entity';
import {SimulationAssembler} from '../../../infrastructure/simulation-assembler';
import {SimulationResource} from '../../../infrastructure/simulation-response';
import {CreditSimulationStore} from '../../../application/credit-simulation.store';
import {SimulationsList} from './simulations-list';

const assembler = new SimulationAssembler();

function makeSim(id: string, clientId: string, state = 'GENERATED'): CreditSimulation {
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
    state,
    createdAt: '2026-06-01T12:00:00Z',
  };
  return assembler.toEntityFromResource(resource);
}

describe('SimulationsList', () => {
  let simulations: WritableSignal<CreditSimulation[]>;
  let loading: WritableSignal<boolean>;
  let isEmpty: WritableSignal<boolean>;
  let clients: WritableSignal<Client[]>;
  let offers: WritableSignal<VehicleOffer[]>;
  let store: {loadAll: ReturnType<typeof vi.fn>};
  let clientsStore: {load: ReturnType<typeof vi.fn>};
  let offersStore: {load: ReturnType<typeof vi.fn>};

  function setup(): ComponentFixture<SimulationsList> {
    simulations = signal<CreditSimulation[]>([]);
    loading = signal(false);
    isEmpty = signal(false);
    clients = signal<Client[]>([]);
    offers = signal<VehicleOffer[]>([]);
    store = {loadAll: vi.fn(), simulations, loading, isEmpty} as never;
    clientsStore = {load: vi.fn(), clients} as never;
    offersStore = {load: vi.fn(), offers} as never;

    TestBed.configureTestingModule({
      imports: [SimulationsList],
      providers: [
        provideRouter([]),
        {provide: CreditSimulationStore, useValue: store},
        {provide: ClientsStore, useValue: clientsStore},
        {provide: VehicleOffersStore, useValue: offersStore},
      ],
    });
    const fixture = TestBed.createComponent(SimulationsList);
    fixture.detectChanges();
    return fixture;
  }

  it('loads simulations, clients and offers on init', () => {
    setup();
    expect(store.loadAll).toHaveBeenCalledTimes(1);
    expect(clientsStore.load).toHaveBeenCalledTimes(1);
    expect(offersStore.load).toHaveBeenCalledTimes(1);
  });

  it('renders each simulation with its resolved client and vehicle labels', () => {
    const fixture = setup();
    clients.set([
      new Client({
        id: 'cl-1',
        documentId: new DocumentId({type: DocumentType.DNI, number: '12345678'}),
        contactInfo: ContactInfo.of('ana@example.com', null, null),
      }),
    ]);
    offers.set([
      new VehicleOffer({
        id: 'vo-1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2024,
        salePrice: new Money({amount: 16000, currency: Currency.PEN}),
      }),
    ]);
    simulations.set([makeSim('s-1', 'cl-1')]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('.sim-table tbody tr');
    expect(rows).toHaveLength(1);
    const text = el.textContent ?? '';
    expect(text).toContain('12345678');
    expect(text).toContain('Toyota');
    expect(text).toContain('Corolla');
    const detail = el.querySelector<HTMLAnchorElement>('.sim-table tbody a[href]');
    expect(detail?.getAttribute('href')).toContain('/credit-simulations/s-1');
  });

  it('filters the rows by state', () => {
    const fixture = setup();
    simulations.set([makeSim('s-1', 'cl-1', 'GENERATED'), makeSim('s-2', 'cl-1', 'SAVED')]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.sim-table tbody tr')).toHaveLength(2);

    const instance = fixture.componentInstance as unknown as {stateFilter: WritableSignal<string>};
    instance.stateFilter.set('SAVED');
    fixture.detectChanges();
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('.sim-table tbody tr');
    expect(rows).toHaveLength(1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('SAVED');
  });

  it('shows the empty state with a CTA when there are no simulations', () => {
    const fixture = setup();
    isEmpty.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty')).not.toBeNull();
    const cta = el.querySelector<HTMLAnchorElement>('.empty a[href]');
    expect(cta?.getAttribute('href')).toContain('/credit-simulations/new');
  });
});
