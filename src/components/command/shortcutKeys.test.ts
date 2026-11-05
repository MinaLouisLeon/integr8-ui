import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectShortcutPlatform, formatShortcut } from './shortcutKeys';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('formatShortcut', () => {
  it('uses Apple symbols on mac, joined without a separator', () => {
    expect(formatShortcut('mod+shift+p', 'mac')).toEqual({
      keys: ['⌘', '⇧', 'P'],
      text: '⌘⇧P',
      label: 'Command+Shift+P',
    });
  });

  it('uses key names elsewhere, joined with +', () => {
    expect(formatShortcut('mod+shift+p', 'other')).toEqual({
      keys: ['Ctrl', 'Shift', 'P'],
      text: 'Ctrl+Shift+P',
      label: 'Control+Shift+P',
    });
  });

  it('accepts an array, aliases and any letter case', () => {
    expect(formatShortcut(['CMD', 'Option', 'ArrowUp'], 'mac').keys).toEqual(['⌘', '⌥', '↑']);
    expect(formatShortcut(['Control', 'Escape'], 'other').keys).toEqual(['Ctrl', 'Esc']);
    expect(formatShortcut('meta+return', 'other').keys).toEqual(['Win', 'Enter']);
  });

  it('ignores whitespace and keeps the given order', () => {
    expect(formatShortcut(' alt + shift + f ', 'other').text).toBe('Alt+Shift+F');
  });

  it('treats a trailing + as the plus key', () => {
    expect(formatShortcut('mod++', 'other').keys).toEqual(['Ctrl', '+']);
    expect(formatShortcut('+', 'mac').label).toBe('Plus');
  });

  it('upper-cases letters and function keys and keeps other keys as written', () => {
    expect(formatShortcut('f5', 'other').keys).toEqual(['F5']);
    expect(formatShortcut('mod+,', 'mac').text).toBe('⌘,');
    expect(formatShortcut('mod+PrintScreen', 'other').keys).toEqual(['Ctrl', 'PrintScreen']);
  });

  it('returns nothing for an empty shortcut', () => {
    expect(formatShortcut('', 'mac')).toEqual({ keys: [], text: '', label: '' });
  });
});

describe('detectShortcutPlatform', () => {
  it('detects Apple platforms from the user agent data', () => {
    vi.stubGlobal('navigator', {
      userAgentData: { platform: 'macOS' },
      platform: '',
      userAgent: '',
    });
    expect(detectShortcutPlatform()).toBe('mac');
  });

  it('falls back to navigator.platform and the user agent', () => {
    vi.stubGlobal('navigator', { platform: 'iPhone', userAgent: '' });
    expect(detectShortcutPlatform()).toBe('mac');

    vi.stubGlobal('navigator', { platform: '', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' });
    expect(detectShortcutPlatform()).toBe('other');
  });

  it('returns other for Windows', () => {
    vi.stubGlobal('navigator', { platform: 'Win32', userAgent: 'Windows NT 10.0' });
    expect(detectShortcutPlatform()).toBe('other');
  });

  it('returns other on the server', () => {
    vi.stubGlobal('navigator', undefined);
    expect(detectShortcutPlatform()).toBe('other');
  });
});
