import {ClientDraft} from '../domain/model/client-draft.command';
import {DocumentType} from '../domain/model/document-type';
import {ClientResource} from './client-response';
import {ClientAssembler} from './client-assembler';

function makeDraft(overrides: Partial<{
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}> = {}): ClientDraft {
  return new ClientDraft({
    documentType: DocumentType.DNI,
    documentNumber: '12345678',
    firstName: 'Ana María',
    lastName: 'Pérez García',
    email: null,
    phone: null,
    address: null,
    ...overrides,
  });
}

function makeResource(overrides: Partial<ClientResource> = {}): ClientResource {
  return {
    id: 'c-1',
    documentType: 'DNI',
    documentNumber: '12345678',
    firstName: 'Ana María',
    lastName: 'Pérez García',
    email: null,
    phone: null,
    address: null,
    ...overrides,
  };
}

describe('ClientAssembler', () => {
  const assembler = new ClientAssembler();

  it('maps a draft to a register request with document, name and present contact fields', () => {
    const request = assembler.toRegisterRequest(
      makeDraft({email: 'ana@example.com', phone: '999111222', address: 'Av. Siempre Viva 123'}),
    );
    expect(request).toEqual({
      documentType: 'DNI',
      documentNumber: '12345678',
      firstName: 'Ana María',
      lastName: 'Pérez García',
      email: 'ana@example.com',
      phone: '999111222',
      address: 'Av. Siempre Viva 123',
    });
  });

  it('omits blank contact fields but keeps document and name in the register request', () => {
    const request = assembler.toRegisterRequest(
      makeDraft({documentType: DocumentType.CE, email: '  ', phone: null, address: ''}),
    );
    expect(request).toEqual({
      documentType: 'CE',
      documentNumber: '12345678',
      firstName: 'Ana María',
      lastName: 'Pérez García',
    });
  });

  it('maps a draft to an update request with name and contact but no document', () => {
    const request = assembler.toUpdateRequest(
      makeDraft({email: 'ana@example.com', phone: '999111222', address: null}),
    );
    expect(request).toEqual({
      firstName: 'Ana María',
      lastName: 'Pérez García',
      email: 'ana@example.com',
      phone: '999111222',
    });
    expect('documentType' in request).toBe(false);
    expect('documentNumber' in request).toBe(false);
  });

  it('maps a response to the entity with a DocumentId, PersonName and ContactInfo', () => {
    const entity = assembler.toEntityFromResource(
      makeResource({
        documentType: 'PASAPORTE',
        documentNumber: 'X1234567',
        email: 'ana@example.com',
        address: 'Lima',
      }),
    );
    expect(entity.id).toBe('c-1');
    expect(entity.documentId.type).toBe(DocumentType.PASAPORTE);
    expect(entity.documentId.number).toBe('X1234567');
    expect(entity.name?.firstName).toBe('Ana María');
    expect(entity.name?.lastName).toBe('Pérez García');
    expect(entity.displayName).toBe('Ana Pérez');
    expect(entity.contactInfo?.email).toBe('ana@example.com');
    expect(entity.contactInfo?.phone).toBeNull();
    expect(entity.contactInfo?.address).toBe('Lima');
  });

  it('maps a response without any contact to a null ContactInfo', () => {
    const entity = assembler.toEntityFromResource(makeResource({documentNumber: '87654321'}));
    expect(entity.contactInfo).toBeNull();
  });

  it('maps a legacy response without a name to a null PersonName and falls back to the document', () => {
    const entity = assembler.toEntityFromResource(
      makeResource({documentNumber: '87654321', firstName: null, lastName: null}),
    );
    expect(entity.name).toBeNull();
    expect(entity.displayName).toBe('DNI 87654321');
  });

  it('maps a list of resources', () => {
    const entities = assembler.toEntitiesFromResource([makeResource()]);
    expect(entities).toHaveLength(1);
    expect(entities[0].documentId.number).toBe('12345678');
    expect(entities[0].displayName).toBe('Ana Pérez');
  });
});
