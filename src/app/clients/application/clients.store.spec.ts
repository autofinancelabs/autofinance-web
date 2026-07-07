import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {ApiError} from '../../shared/infrastructure/api-error';
import {Client} from '../domain/model/client.entity';
import {ClientDraft} from '../domain/model/client-draft.command';
import {ContactInfo} from '../domain/model/contact-info.value-object';
import {DocumentId} from '../domain/model/document-id.value-object';
import {DocumentType} from '../domain/model/document-type';
import {PersonName} from '../domain/model/person-name.value-object';
import {ClientsApi} from '../infrastructure/clients-api';
import {ClientsStore} from './clients.store';

function makeClient(id = 'c-1'): Client {
  return new Client({
    id,
    documentId: new DocumentId({type: DocumentType.DNI, number: '12345678'}),
    name: new PersonName({firstName: 'Ana María', lastName: 'Pérez García'}),
    contactInfo: ContactInfo.of('ana@example.com', null, null),
  });
}

function makeDraft(): ClientDraft {
  return new ClientDraft({
    documentType: DocumentType.DNI,
    documentNumber: '12345678',
    firstName: 'Ana María',
    lastName: 'Pérez García',
    email: 'ana@example.com',
    phone: null,
    address: null,
  });
}

describe('ClientsStore', () => {
  let api: {
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  function createStore(): ClientsStore {
    TestBed.configureTestingModule({
      providers: [ClientsStore, {provide: ClientsApi, useValue: api}],
    });
    return TestBed.inject(ClientsStore);
  }

  beforeEach(() => {
    api = {getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn()};
  });

  it('load populates clients', () => {
    api.getAll.mockReturnValue(of([makeClient('c-1'), makeClient('c-2')]));
    const store = createStore();
    store.load();
    expect(store.clients()).toHaveLength(2);
    expect(store.loading()).toBe(false);
  });

  it('load failure captures the ApiError', () => {
    const error = new ApiError({status: 500, code: 'INTERNAL_ERROR'});
    api.getAll.mockReturnValue(throwError(() => error));
    const store = createStore();
    store.load();
    expect(store.error()).toBe(error);
  });

  it('create success flips saved', () => {
    api.create.mockReturnValue(of(makeClient()));
    const store = createStore();
    store.create(makeDraft());
    expect(store.saved()).toBe(true);
    expect(store.saving()).toBe(false);
  });

  it('create failure (duplicate document) sets error and does not flip saved', () => {
    const error = new ApiError({status: 409, code: 'DUPLICATE_CLIENT_DOCUMENT'});
    api.create.mockReturnValue(throwError(() => error));
    const store = createStore();
    store.create(makeDraft());
    expect(store.error()).toBe(error);
    expect(store.saved()).toBe(false);
  });

  it('update success flips saved', () => {
    api.update.mockReturnValue(of(makeClient('c-9')));
    const store = createStore();
    store.update('c-9', makeDraft());
    expect(api.update).toHaveBeenCalledWith('c-9', expect.any(ClientDraft));
    expect(store.saved()).toBe(true);
  });

  it('loadOne sets the selected client', () => {
    api.getById.mockReturnValue(of(makeClient('c-9')));
    const store = createStore();
    store.loadOne('c-9');
    expect(store.selected()?.id).toBe('c-9');
  });
});
