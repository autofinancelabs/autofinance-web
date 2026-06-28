import {signal, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NotificationService, Toast} from '../../../infrastructure/notification.service';
import {Toaster} from './toaster';

describe('Toaster', () => {
  let toasts: WritableSignal<Toast[]>;
  let service: {dismiss: ReturnType<typeof vi.fn>};

  function setup() {
    toasts = signal<Toast[]>([]);
    service = {dismiss: vi.fn(), toasts} as never;
    TestBed.configureTestingModule({
      imports: [Toaster],
      providers: [{provide: NotificationService, useValue: service}],
    });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the toast message', () => {
    const fixture = setup();
    toasts.set([{id: 1, message: 'Algo falló', variant: 'error', leaving: false}]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Algo falló');
  });

  it('dismiss button calls NotificationService.dismiss with the id', () => {
    const fixture = setup();
    toasts.set([{id: 7, message: 'x', variant: 'info', leaving: false}]);
    fixture.detectChanges();
    const close = (fixture.nativeElement as HTMLElement).querySelector(
      '.toast__close',
    ) as HTMLButtonElement;
    close.click();
    expect(service.dismiss).toHaveBeenCalledWith(7);
  });
});
