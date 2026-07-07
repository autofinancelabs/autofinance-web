import {Dealership} from '../domain/model/dealership.entity';
import {DealershipRegistration} from '../domain/model/dealership-registration.command';
import {DealershipResource, RegisterDealershipResource} from './dealership-response';

/**
 * Anti-corruption layer for dealership registration: translates between the
 * domain command/entity and the wire DTOs. A null `contactEmail` is omitted from
 * the request (the field is optional on the backend).
 */
export class DealershipAssembler {
  toRequestFromCommand(command: DealershipRegistration): RegisterDealershipResource {
    return {
      name: command.name,
      ruc: command.ruc,
      contactEmail: command.contactEmail ?? undefined,
      userEmail: command.userEmail,
      username: command.username,
      password: command.password,
    };
  }

  toEntityFromResource(resource: DealershipResource): Dealership {
    return new Dealership({
      id: resource.id,
      name: resource.name,
      ruc: resource.ruc,
      contactEmail: resource.contactEmail,
    });
  }
}
