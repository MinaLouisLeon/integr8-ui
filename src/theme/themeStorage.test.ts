import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLocalStorageThemeStorage, DEFAULT_STORAGE_KEY } from './themeStorage';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('createLocalStorageThemeStorage', () => {
  it('uses the integr8-theme key by default', () => {
    const storage = createLocalStorageThemeStorage();

    expect(DEFAULT_STORAGE_KEY).toBe('integr8-theme');
    expect(storage.get()).toBeNull();
    storage.set('integr8');
    expect(window.localStorage.getItem('integr8-theme')).toBe('integr8');
    expect(storage.get()).toBe('integr8');
  });

  it('uses a custom key', () => {
    const storage = createLocalStorageThemeStorage('my-key');

    storage.set('dark');
    expect(window.localStorage.getItem('my-key')).toBe('dark');
  });

  it('returns null and ignores writes when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const storage = createLocalStorageThemeStorage();

    expect(storage.get()).toBeNull();
    expect(() => storage.set('dark')).not.toThrow();
  });
});
