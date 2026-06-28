import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {HlmInput} from './hlm-input';

@Component({
  imports: [HlmInput],
  template: `<input hlmInput id="x" />`,
})
class HostComponent {}

describe('HlmInput', () => {
  it('applies the input data-slot and base classes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.getAttribute('data-slot')).toBe('input');
    expect(input.className).toContain('border-input');
    expect(input.className).toContain('rounded-md');
    expect(input.className).toContain('h-9');
    expect(input.className).toContain('aria-invalid:border-destructive');
  });
});
