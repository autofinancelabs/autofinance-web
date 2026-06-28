import {TokenStorage} from './token-storage';

describe('TokenStorage', () => {
  let storage: TokenStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = new TokenStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('returns null when no token is stored', () => {
    expect(storage.getToken()).toBeNull();
  });

  it('round-trips a token through storage', () => {
    storage.setToken('jwt-123');
    expect(storage.getToken()).toBe('jwt-123');
  });

  it('clears the stored token', () => {
    storage.setToken('jwt-123');
    storage.clear();
    expect(storage.getToken()).toBeNull();
  });

  it('returns null when storage access throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    expect(storage.getToken()).toBeNull();
  });

  it('does not throw when setItem fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => storage.setToken('jwt-123')).not.toThrow();
  });
});
