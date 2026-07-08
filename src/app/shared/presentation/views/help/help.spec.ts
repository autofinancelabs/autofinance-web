import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Help} from './help';

describe('Help', () => {
  it('renders the assistance guide and the main action', () => {
    TestBed.configureTestingModule({
      imports: [Help],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(Help);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Guia para el asesor de ventas');
    expect(el.textContent).toContain('Flujo recomendado');
    expect(el.textContent).toContain('Checklist operativo');
    expect(el.textContent).toContain('VAN');
    expect(el.querySelector('a[href="/credit-simulations/new"]')).not.toBeNull();
  });
});
