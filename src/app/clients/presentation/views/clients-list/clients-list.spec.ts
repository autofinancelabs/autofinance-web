import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Client} from '../../../domain/model/client.entity';
import {ContactInfo} from '../../../domain/model/contact-info.value-object';
import {DocumentId} from '../../../domain/model/document-id.value-object';
import {DocumentType} from '../../../domain/model/document-type';
import {ClientsStore} from '../../../application/clients.store';
import {ClientsList} from './clients-list';

describe('ClientsList', () => {
  let clients: WritableSignal<Client[]>;
  let loading: WritableSignal<boolean>;
  let isEmpty: WritableSignal<boolean>;
  let store: {load: ReturnType<typeof vi.fn>};

  function setup(): ComponentFixture<ClientsList> {
    clients = signal<Client[]>([]);
    loading = signal(false);
    isEmpty = signal(true);
    store = {load: vi.fn(), clients, loading, isEmpty} as never;

    TestBed.configureTestingModule({
      imports: [ClientsList],
      providers: [provideRouter([]), {provide: ClientsStore, useValue: store}],
    });
    const fixture = TestBed.createComponent(ClientsList);
    fixture.detectChanges();
    return fixture;
  }

  it('loads clients on init', () => {
    setup();
    expect(store.load).toHaveBeenCalledTimes(1);
  });

  it('renders clients with their document and contact', () => {
    const fixture = setup();
    clients.set([
      new Client({
        id: 'c-1',
        documentId: new DocumentId({type: DocumentType.DNI, number: '12345678'}),
        contactInfo: ContactInfo.of('ana@example.com', '999111222', null),
      }),
    ]);
    isEmpty.set(false);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('DNI');
    expect(text).toContain('12345678');
    expect(text).toContain('ana@example.com');
    expect(text).toContain('999111222');
  });

  it('shows an empty state when there are no clients', () => {
    const fixture = setup();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aún no has registrado');
  });
});
