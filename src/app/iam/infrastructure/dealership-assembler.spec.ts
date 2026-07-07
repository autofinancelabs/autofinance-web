import {DealershipRegistration} from '../domain/model/dealership-registration.command';
import {DealershipAssembler} from './dealership-assembler';

describe('DealershipAssembler', () => {
  const assembler = new DealershipAssembler();

  it('maps a registration command to the request, keeping contactEmail', () => {
    const request = assembler.toRequestFromCommand(
      new DealershipRegistration({
        name: 'AutoNorte',
        ruc: '20123456789',
        contactEmail: 'ventas@autonorte.pe',
        userEmail: 'ana@autonorte.pe',
        username: 'ana',
        password: 'pw',
      }),
    );
    expect(request).toEqual({
      name: 'AutoNorte',
      ruc: '20123456789',
      contactEmail: 'ventas@autonorte.pe',
      userEmail: 'ana@autonorte.pe',
      username: 'ana',
      password: 'pw',
    });
  });

  it('omits contactEmail from the request when it is null', () => {
    const request = assembler.toRequestFromCommand(
      new DealershipRegistration({
        name: 'AutoNorte',
        ruc: '20123456789',
        contactEmail: null,
        userEmail: 'ana@autonorte.pe',
        username: 'ana',
        password: 'pw',
      }),
    );
    expect(request.contactEmail).toBeUndefined();
  });

  it('maps a dealership resource to the entity (null contactEmail preserved)', () => {
    const dealership = assembler.toEntityFromResource({
      id: 'd-1',
      name: 'AutoNorte',
      ruc: '20123456789',
      contactEmail: null,
    });
    expect(dealership.id).toBe('d-1');
    expect(dealership.name).toBe('AutoNorte');
    expect(dealership.ruc).toBe('20123456789');
    expect(dealership.contactEmail).toBeNull();
  });
});
