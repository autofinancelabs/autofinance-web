import {ClientDraft} from '../domain/model/client-draft.command';
import {DocumentType} from '../domain/model/document-type';
import {ClientAssembler} from './client-assembler';

function makeDraft(overrides: Partial<{
  documentType: DocumentType;
  documentNumber: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}> = {}): ClientDraft {
  return new ClientDraft({
    documentType: DocumentType.DNI,
    documentNumber: '12345678',
    email: null,
    phone: null,
    address: null,
    ...overrides,
  });
}

describe('ClientAssembler', () => {
  const assembler = new ClientAssembler();

  it('maps a draft to a register request with document and present contact fields', () => {
    const request = assembler.toRegisterRequest(
      makeDraft({email: 'ana@example.com', phone: '999111222', address: 'Av. Siempre Viva 123'}),
    );
    expect(request).toEqual({
      documentType: 'DNI',
      documentNumber: '12345678',
      email: 'ana@example.com',
      phone: '999111222',
      address: 'Av. Siempre Viva 123',
    });
  });

  it('omits blank contact fields from the register request', () => {
    const request = assembler.toRegisterRequest(
      makeDraft({documentType: DocumentType.CE, email: '  ', phone: null, address: ''}),
    );
    expect(request).toEqual({documentType: 'CE', documentNumber: '12345678'});
  });

  it('maps a draft to an update request with only the contact fields', () => {
    const request = assembler.toUpdateRequest(
      makeDraft({email: 'ana@example.com', phone: '999111222', address: null}),
    );
    expect(request).toEqual({email: 'ana@example.com', phone: '999111222'});
    expect('documentType' in request).toBe(false);
    expect('documentNumber' in request).toBe(false);
  });

  it('maps a response to the entity with a DocumentId and ContactInfo', () => {
    const entity = assembler.toEntityFromResource({
      id: 'c-1',
      documentType: 'PASAPORTE',
      documentNumber: 'X1234567',
      email: 'ana@example.com',
      phone: null,
      address: 'Lima',
    });
    expect(entity.id).toBe('c-1');
    expect(entity.documentId.type).toBe(DocumentType.PASAPORTE);
    expect(entity.documentId.number).toBe('X1234567');
    expect(entity.contactInfo?.email).toBe('ana@example.com');
    expect(entity.contactInfo?.phone).toBeNull();
    expect(entity.contactInfo?.address).toBe('Lima');
  });

  it('maps a response without any contact to a null ContactInfo', () => {
    const entity = assembler.toEntityFromResource({
      id: 'c-2',
      documentType: 'DNI',
      documentNumber: '87654321',
      email: null,
      phone: null,
      address: null,
    });
    expect(entity.contactInfo).toBeNull();
  });

  it('maps a list of resources', () => {
    const entities = assembler.toEntitiesFromResource([
      {
        id: 'c-1',
        documentType: 'DNI',
        documentNumber: '12345678',
        email: null,
        phone: null,
        address: null,
      },
    ]);
    expect(entities).toHaveLength(1);
    expect(entities[0].documentId.number).toBe('12345678');
  });
});
