import {TestBed} from '@angular/core/testing';
import {NotificationService} from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [NotificationService]});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => vi.useRealTimers());

  it('pushes a toast per variant with the given message', () => {
    service.error('boom');
    service.success('ok');
    service.info('fyi');

    expect(service.toasts().map(t => t.variant)).toEqual(['error', 'success', 'info']);
    expect(service.toasts().map(t => t.message)).toEqual(['boom', 'ok', 'fyi']);
  });

  it('dismiss marks the toast leaving, then removes it after the exit animation', () => {
    vi.useFakeTimers();
    service.error('boom');
    const id = service.toasts()[0].id;

    service.dismiss(id);
    // Still present but flagged leaving so the exit animation can play.
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].leaving).toBe(true);

    vi.advanceTimersByTime(200);
    expect(service.toasts()).toHaveLength(0);
  });

  it('auto-dismisses after the timeout (plus the exit animation)', () => {
    vi.useFakeTimers();
    service.error('boom');
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(5000);
    expect(service.toasts()[0].leaving).toBe(true);

    vi.advanceTimersByTime(200);
    expect(service.toasts()).toHaveLength(0);
  });
});
