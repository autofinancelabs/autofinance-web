import {Credentials} from '../domain/model/credentials.command';
import {AuthenticatedUserAssembler} from './authenticated-user-assembler';

describe('AuthenticatedUserAssembler', () => {
  const assembler = new AuthenticatedUserAssembler();

  it('maps a Credentials command to the sign-in request', () => {
    const request = assembler.toRequestFromCommand(
      new Credentials({identifier: 'ana', password: 's3cr3t'}),
    );
    expect(request).toEqual({identifier: 'ana', password: 's3cr3t'});
  });

  it('maps the response userId onto the entity id', () => {
    const user = assembler.toEntityFromResource({
      userId: 'u-1',
      username: 'ana',
      dealershipId: 'd-1',
      token: 'jwt',
    });
    expect(user.id).toBe('u-1');
    expect(user.username).toBe('ana');
    expect(user.dealershipId).toBe('d-1');
    expect(user.token).toBe('jwt');
  });
});
