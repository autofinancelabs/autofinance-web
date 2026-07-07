import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {AuthStore} from '../../../../iam/application/auth.store';
import {AuthenticatedUser} from '../../../../iam/domain/model/authenticated-user.entity';
import {ClientsStore} from '../../../../clients/application/clients.store';
import {VehicleOffersStore} from '../../../../vehicle-offers/application/vehicle-offers.store';
import {CreditSimulationStore} from '../../../../credit-simulation/application/credit-simulation.store';
import {Dashboard} from './dashboard';

describe('Dashboard', () => {
  function setup() {
    const currentUser = signal<AuthenticatedUser | null>(
      new AuthenticatedUser({id: 'u-1', username: 'ana', dealershipId: 'd-1', token: 't'}),
    );
    const clientsStore = {clients: signal([]), load: vi.fn()};
    const offersStore = {offers: signal([]), load: vi.fn()};
    const simulationsStore = {simulations: signal([]), loadAll: vi.fn()};

    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {provide: AuthStore, useValue: {currentUser}},
        {provide: ClientsStore, useValue: clientsStore},
        {provide: VehicleOffersStore, useValue: offersStore},
        {provide: CreditSimulationStore, useValue: simulationsStore},
      ],
    });
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    return {fixture, clientsStore, offersStore, simulationsStore};
  }

  it('greets the user and links to the vehicle offers area', () => {
    const {fixture} = setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hola, ana');
    expect(el.querySelector('a[href="/vehicle-offers"]')).not.toBeNull();
  });

  it('loads the context stores on init', () => {
    const {clientsStore, offersStore, simulationsStore} = setup();
    expect(clientsStore.load).toHaveBeenCalledTimes(1);
    expect(offersStore.load).toHaveBeenCalledTimes(1);
    expect(simulationsStore.loadAll).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state for recent quotations when there are none', () => {
    const {fixture} = setup();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aún no hay cotizaciones');
  });
});
