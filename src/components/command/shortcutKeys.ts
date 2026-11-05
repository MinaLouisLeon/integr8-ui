/** Which keyboard style a shortcut is shown in: Apple symbols (`⌘⇧P`) or `Ctrl+Shift+P`. */
export type ShortcutPlatform = 'mac' | 'other';

/** What {@link formatShortcut} returns. */
export interface FormattedShortcut {
  /** One display label per key, such as `['⌘', '⇧', 'P']` or `['Ctrl', 'Shift', 'P']`. */
  keys: string[];
  /** The whole shortcut as one string: `⌘⇧P` on Apple platforms, `Ctrl+Shift+P` elsewhere. */
  text: string;
  /** A spoken form for screen readers, such as `Command+Shift+P` or `Control+Shift+P`. */
  label: string;
}

type KeyLabels = readonly [display: string, spoken: string];

interface NamedKey {
  mac: KeyLabels;
  other: KeyLabels;
}

function same(display: string, spoken: string = display): NamedKey {
  return { mac: [display, spoken], other: [display, spoken] };
}

const NAMED_KEYS: Readonly<Record<string, NamedKey>> = {
  mod: { mac: ['⌘', 'Command'], other: ['Ctrl', 'Control'] },
  meta: { mac: ['⌘', 'Command'], other: ['Win', 'Windows'] },
  ctrl: { mac: ['⌃', 'Control'], other: ['Ctrl', 'Control'] },
  alt: { mac: ['⌥', 'Option'], other: ['Alt', 'Alt'] },
  shift: { mac: ['⇧', 'Shift'], other: ['Shift', 'Shift'] },
  enter: { mac: ['↵', 'Return'], other: ['Enter', 'Enter'] },
  backspace: { mac: ['⌫', 'Delete'], other: ['Backspace', 'Backspace'] },
  delete: { mac: ['⌦', 'Forward Delete'], other: ['Del', 'Delete'] },
  tab: { mac: ['⇥', 'Tab'], other: ['Tab', 'Tab'] },
  esc: same('Esc', 'Escape'),
  space: same('Space'),
  up: same('↑', 'Up'),
  down: same('↓', 'Down'),
  left: same('←', 'Left'),
  right: same('→', 'Right'),
  pageup: same('PgUp', 'Page Up'),
  pagedown: same('PgDn', 'Page Down'),
  home: same('Home'),
  end: same('End'),
  plus: same('+', 'Plus'),
};

const ALIASES: Readonly<Record<string, string>> = {
  cmd: 'meta',
  command: 'meta',
  win: 'meta',
  super: 'meta',
  control: 'ctrl',
  option: 'alt',
  opt: 'alt',
  return: 'enter',
  del: 'delete',
  escape: 'esc',
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  '+': 'plus',
};

/**
 * Splits `'mod+shift+p'` into `['mod', 'shift', 'p']`. A `+` that ends the string is the plus
 * key itself, so `'mod++'` is `['mod', '+']`. Whitespace is ignored.
 */
function splitKeys(keys: string | readonly string[]): string[] {
  if (typeof keys !== 'string') return keys.map((key) => key.trim()).filter(Boolean);
  return keys
    .replace(/\s+/g, '')
    .split(/\+(?=.)/)
    .filter(Boolean);
}

function describeKey(key: string, platform: ShortcutPlatform): KeyLabels {
  const lower = key.toLowerCase();
  const named = NAMED_KEYS[ALIASES[lower] ?? lower];
  if (named) return named[platform];
  // Letters and function keys are upper-cased (`p` → `P`, `f5` → `F5`); the rest as given.
  const display = key.length === 1 || /^f\d{1,2}$/i.test(key) ? key.toUpperCase() : key;
  return [display, display];
}

/**
 * Turns a shortcut description into display labels for one platform.
 *
 * Keys are separated by `+` (or passed as an array) and are case-insensitive. `mod` is `⌘` on
 * Apple platforms and `Ctrl` elsewhere, the usual "primary modifier". Other names: `ctrl`,
 * `alt` (`option`), `shift`, `meta` (`cmd`, `win`), `enter`, `esc`, `tab`, `space`,
 * `backspace`, `delete`, `up`, `down`, `left`, `right`, `pageup`, `pagedown`, `home`, `end`,
 * `plus`. Any other key is shown as written, with single letters and `f1`–`f24` upper-cased.
 * Keys keep the order you give them.
 *
 * @example
 * ```ts
 * formatShortcut('mod+shift+p', 'mac').text;   // '⌘⇧P'
 * formatShortcut('mod+shift+p', 'other').text; // 'Ctrl+Shift+P'
 * formatShortcut(['alt', 'up'], 'other').keys; // ['Alt', '↑']
 * ```
 */
export function formatShortcut(
  keys: string | readonly string[],
  platform: ShortcutPlatform,
): FormattedShortcut {
  const described = splitKeys(keys).map((key) => describeKey(key, platform));
  const display = described.map(([label]) => label);
  return {
    keys: display,
    text: display.join(platform === 'mac' ? '' : '+'),
    label: described.map(([, spoken]) => spoken).join('+'),
  };
}

/**
 * Guesses the keyboard style of the current device from the browser: `'mac'` on macOS, iOS and
 * iPadOS, `'other'` everywhere else and on the server.
 */
export function detectShortcutPlatform(): ShortcutPlatform {
  if (typeof navigator === 'undefined') return 'other';
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const name = nav.userAgentData?.platform || nav.platform || nav.userAgent;
  return /mac|iphone|ipad|ipod/i.test(name) ? 'mac' : 'other';
}
