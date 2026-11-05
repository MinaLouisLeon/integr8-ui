'use client';

import { type ComponentProps, type JSX, useSyncExternalStore } from 'react';
import { cn } from '../../lib/cn';
import { Kbd } from '../basics/Kbd';
import { detectShortcutPlatform, formatShortcut, type ShortcutPlatform } from './shortcutKeys';

/** Props for {@link Shortcut}. */
export type ShortcutProps = Omit<ComponentProps<'span'>, 'children'> & {
  /**
   * The keys, joined with `+` (`'mod+shift+p'`) or as an array (`['mod', 'k']`).
   * `mod` is `⌘` on Apple platforms and `Ctrl` elsewhere. See {@link formatShortcut} for every
   * key name.
   */
  keys: string | readonly string[];
  /**
   * `'kbd'` draws each key as a {@link Kbd}. `'text'` renders plain text (`⌘⇧P` or
   * `Ctrl+Shift+P`), for menu items and tooltips. Default `'kbd'`.
   */
  variant?: 'kbd' | 'text' | undefined;
  /** Force a keyboard style instead of detecting it from the browser. */
  platform?: ShortcutPlatform | undefined;
};

const noSubscribe = (): (() => void) => () => {};
const serverPlatform = (): ShortcutPlatform => 'other';

/**
 * Shows a keyboard shortcut in the style of the user's OS: `⌘ ⇧ P` on macOS and iOS,
 * `Ctrl Shift P` on Windows and Linux. Screen readers hear the key names
 * ("Command+Shift+P"). Display only; it does not bind keys.
 *
 * During server rendering and hydration it uses the non-Apple style, then switches on the
 * client, so there is no hydration mismatch.
 *
 * @example
 * ```tsx
 * <Shortcut keys="mod+k" />
 * <DropdownMenuItem>
 *   Save <DropdownMenuShortcut><Shortcut keys="mod+s" variant="text" /></DropdownMenuShortcut>
 * </DropdownMenuItem>
 * ```
 */
export function Shortcut({
  keys,
  variant = 'kbd',
  platform,
  className,
  ...props
}: ShortcutProps): JSX.Element {
  const detected = useSyncExternalStore(noSubscribe, detectShortcutPlatform, serverPlatform);
  const formatted = formatShortcut(keys, platform ?? detected);

  if (variant === 'text') {
    return (
      <span data-slot="shortcut" data-variant="text" className={className} {...props}>
        <span className="sr-only">{formatted.label}</span>
        <span aria-hidden="true">{formatted.text}</span>
      </span>
    );
  }

  return (
    <span
      data-slot="shortcut"
      data-variant="kbd"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    >
      <span className="sr-only">{formatted.label}</span>
      {formatted.keys.map((key, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: keys can repeat (`g g`) and the list is static.
        <Kbd key={`${index}-${key}`} aria-hidden="true">
          {key}
        </Kbd>
      ))}
    </span>
  );
}
