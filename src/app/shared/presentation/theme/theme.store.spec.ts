import {TestBed} from '@angular/core/testing';
import {ThemeStore} from './theme.store';

describe('ThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.restoreAllMocks();
  });

  function create(): ThemeStore {
    TestBed.configureTestingModule({providers: [ThemeStore]});
    return TestBed.inject(ThemeStore);
  }

  it('defaults to light when nothing is stored', () => {
    const store = create();
    expect(store.theme()).toBe('light');
    expect(store.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('restores an explicitly stored theme and applies the document class', () => {
    localStorage.setItem('autofinance.theme', 'dark');
    const store = create();
    expect(store.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles the theme, persists it, and updates the document class', () => {
    const store = create();

    store.toggle();
    expect(store.isDark()).toBe(true);
    expect(localStorage.getItem('autofinance.theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    store.toggle();
    expect(store.isDark()).toBe(false);
    expect(localStorage.getItem('autofinance.theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
