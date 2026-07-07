import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {ApiError} from '../../../../shared/infrastructure/api-error';
import {Client} from '../../../domain/model/client.entity';
import {ClientDraft} from '../../../domain/model/client-draft.command';
import {ContactInfo} from '../../../domain/model/contact-info.value-object';
import {DocumentId} from '../../../domain/model/document-id.value-object';
import {DocumentType} from '../../../domain/model/document-type';
import {PersonName} from '../../../domain/model/person-name.value-object';
import {ClientsStore} from '../../../application/clients.store';
import {ClientForm} from './client-form';

const flush = () => new Promise(resolve => setTimeout(resolve));

interface FormModel {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const validModel: FormModel = {
  documentType: 'DNI',
  documentNumber: '12345678',
  firstName: 'Ana María',
  lastName: 'Pérez García',
  email: '',
  phone: '',
  address: '',
};

describe('ClientForm', () => {
  let saving: WritableSignal<boolean>;
  let error: WritableSignal<ApiError | null>;
  let saved: WritableSignal<boolean>;
  let selected: WritableSignal<Client | null>;
  let store: {create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>};
  let router: {navigate: ReturnType<typeof vi.fn>};

  function setup(routeId: string | null = null): ComponentFixture<ClientForm> {
    saving = signal(false);
    error = signal<ApiError | null>(null);
    saved = signal(false);
    selected = signal<Client | null>(null);
    store = {
      create: vi.fn(),
      update: vi.fn(),
      loadOne: vi.fn(),
      resetWriteState: vi.fn(),
      saving,
      error,
      saved,
      selected,
    } as never;
    router = {navigate: vi.fn()};

    TestBed.configureTestingModule({
      imports: [ClientForm],
      providers: [
        {provide: ClientsStore, useValue: store},
        {provide: Router, useValue: router},
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {paramMap: convertToParamMap(routeId ? {id: routeId} : {})}},
        },
      ],
    });
    const fixture = TestBed.createComponent(ClientForm);
    fixture.detectChanges();
    return fixture;
  }

  function instance(fixture: ComponentFixture<ClientForm>) {
    return fixture.componentInstance as unknown as {
      model: WritableSignal<FormModel>;
      onSubmit: (e: Event) => void;
    };
  }

  it('submits a valid draft via create()', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel, email: 'ana@example.com'});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.create).toHaveBeenCalledTimes(1);
    const draft = store.create.mock.calls[0][0] as ClientDraft;
    expect(draft).toBeInstanceOf(ClientDraft);
    expect(draft.documentType).toBe(DocumentType.DNI);
    expect(draft.documentNumber).toBe('12345678');
    expect(draft.firstName).toBe('Ana María');
    expect(draft.lastName).toBe('Pérez García');
    expect(draft.email).toBe('ana@example.com');
    expect(draft.phone).toBeNull();
  });

  it('blocks submit and shows an error when the names are missing', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel, firstName: '', lastName: ''});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();
    fixture.detectChanges();

    expect(store.create).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('obligatorio');
  });

  it('blocks submit and shows an error when the document number is missing', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel, documentNumber: ''});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();
    fixture.detectChanges();

    expect(store.create).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('obligatorio');
  });

  it('blocks submit when the email format is invalid', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel, email: 'not-an-email'});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.create).not.toHaveBeenCalled();
  });

  it('updates contact in edit mode without changing the document', async () => {
    const fixture = setup('c-9');
    selected.set(
      new Client({
        id: 'c-9',
        documentId: new DocumentId({type: DocumentType.CE, number: 'X123'}),
        name: new PersonName({firstName: 'Ana María', lastName: 'Pérez García'}),
        contactInfo: ContactInfo.of('old@example.com', null, null),
      }),
    );
    fixture.detectChanges();
    instance(fixture).model.update(model => ({...model, email: 'new@example.com'}));
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.update).toHaveBeenCalledTimes(1);
    const [id, draft] = store.update.mock.calls[0] as [string, ClientDraft];
    expect(id).toBe('c-9');
    expect(draft.documentNumber).toBe('X123');
    expect(draft.firstName).toBe('Ana María');
    expect(draft.lastName).toBe('Pérez García');
    expect(draft.email).toBe('new@example.com');
  });

  it('navigates to the list once saved', () => {
    const fixture = setup();
    saved.set(true);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/clients']);
  });
});
