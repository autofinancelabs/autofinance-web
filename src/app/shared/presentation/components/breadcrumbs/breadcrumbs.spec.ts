import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Breadcrumbs} from './breadcrumbs';

@Component({
  imports: [Breadcrumbs],
  template: `<app-breadcrumbs [items]="items" />`,
})
class HostComponent {
  items = [{label: 'Dashboard', link: '/dashboard'}, {label: 'Vehículos'}];
}

describe('Breadcrumbs', () => {
  it('links every item but the last, which is marked as the current page', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const link = el.querySelector('a');
    expect(link?.textContent?.trim()).toBe('Dashboard');
    expect(link?.getAttribute('href')).toContain('/dashboard');

    const current = el.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('Vehículos');
  });
});
