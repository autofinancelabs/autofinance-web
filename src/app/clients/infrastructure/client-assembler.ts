import {Client} from '../domain/model/client.entity';
import {ClientDraft} from '../domain/model/client-draft.command';
import {ContactInfo} from '../domain/model/contact-info.value-object';
import {DocumentId} from '../domain/model/document-id.value-object';
import {DocumentType} from '../domain/model/document-type';
import {PersonName} from '../domain/model/person-name.value-object';
import {ClientResource, RegisterClientResource, UpdateClientResource} from './client-response';

/**
 * Anti-corruption layer for clients. Maps the draft command to the two request
 * bodies — register (document + contact) and update (contact only, as the
 * document is immutable) — and the response back to the domain entity.
 */
export class ClientAssembler {
  toRegisterRequest(draft: ClientDraft): RegisterClientResource {
    const resource: RegisterClientResource = {
      documentType: draft.documentType,
      documentNumber: draft.documentNumber,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
    };
    return ClientAssembler.withContact(resource, draft);
  }

  toUpdateRequest(draft: ClientDraft): UpdateClientResource {
    const resource: UpdateClientResource = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
    };
    return ClientAssembler.withContact(resource, draft);
  }

  toEntityFromResource(resource: ClientResource): Client {
    return new Client({
      id: resource.id,
      documentId: new DocumentId({
        type: resource.documentType as DocumentType,
        number: resource.documentNumber,
      }),
      name: PersonName.of(resource.firstName, resource.lastName),
      contactInfo: ContactInfo.of(resource.email, resource.phone, resource.address),
    });
  }

  toEntitiesFromResource(resources: ClientResource[]): Client[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  /** Adds the contact fields that are present (non-blank); leaves blanks omitted. */
  private static withContact<T extends {email?: string; phone?: string; address?: string}>(
    resource: T,
    draft: ClientDraft,
  ): T {
    if (draft.email !== null && draft.email.trim() !== '') {
      resource.email = draft.email.trim();
    }
    if (draft.phone !== null && draft.phone.trim() !== '') {
      resource.phone = draft.phone.trim();
    }
    if (draft.address !== null && draft.address.trim() !== '') {
      resource.address = draft.address.trim();
    }
    return resource;
  }
}
