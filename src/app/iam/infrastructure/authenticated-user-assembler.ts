import {AuthenticatedUser} from '../domain/model/authenticated-user.entity';
import {Credentials} from '../domain/model/credentials.command';
import {AuthenticatedUserResource, SignInRequest} from './authenticated-user-response';

/**
 * Anti-corruption layer for sign-in: translates between the domain command/entity
 * and the wire DTOs. Maps the backend `userId` onto the entity's `id`.
 *
 * Sign-in is a write/command (not CRUD), so this assembler does not implement the
 * CRUD-shaped `BaseAssembler`.
 */
export class AuthenticatedUserAssembler {
  toRequestFromCommand(command: Credentials): SignInRequest {
    return {identifier: command.identifier, password: command.password};
  }

  toEntityFromResource(resource: AuthenticatedUserResource): AuthenticatedUser {
    return new AuthenticatedUser({
      id: resource.userId,
      username: resource.username,
      dealershipId: resource.dealershipId,
      token: resource.token,
    });
  }
}
