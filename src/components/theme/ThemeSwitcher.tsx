'use client';

import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import type { JSX } from 'react';
import { useTheme } from '../../theme/useTheme';
import { Button, type ButtonProps } from '../basics/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../basics/DropdownMenu';

/** Props for {@link ThemeSwitcher}. */
export type ThemeSwitcherProps = Omit<ButtonProps, 'children' | 'asChild'> & {
  /** Accessible name of the button and heading of the menu. Default `'Theme'`. */
  label?: string | undefined;
  /** Name of the theme that follows the OS. Default `'System'`. */
  systemLabel?: string | undefined;
  /** Show the picked theme's name next to the icon. Default `false` (icon only). */
  showLabel?: boolean | undefined;
  /** Where the menu lines up with the button. Default `'end'`. */
  align?: 'start' | 'center' | 'end' | undefined;
};

/**
 * A button with a menu of every theme: System, the built-in themes and any registered with
 * `ThemeProvider`'s `themes` prop. Picking one calls `setTheme`, so the choice is saved
 * through the provider's storage. The icon shows a monitor for System, a moon for dark-based
 * themes and a sun for light-based ones.
 *
 * Must be used inside a `ThemeProvider`.
 *
 * @throws {@link ThemeError} with code `MISSING_PROVIDER` outside a `ThemeProvider`.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <ThemeSwitcher />
 *   <ThemeSwitcher showLabel variant="outline" label="Appearance" />
 * </ThemeProvider>
 * ```
 */
export function ThemeSwitcher({
  label = 'Theme',
  systemLabel = 'System',
  showLabel = false,
  align = 'end',
  variant = 'ghost',
  size,
  ...props
}: ThemeSwitcherProps): JSX.Element {
  const { theme, base, themes, setTheme } = useTheme();
  const options = [{ name: 'system', label: systemLabel }, ...themes];
  const current = options.find((option) => option.name === theme)?.label ?? theme;
  const Icon = theme === 'system' ? MonitorIcon : base === 'dark' ? MoonIcon : SunIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-slot="theme-switcher"
          variant={variant}
          size={size ?? (showLabel ? 'default' : 'icon')}
          aria-label={showLabel ? undefined : `${label}: ${current}`}
          {...props}
        >
          <Icon aria-hidden="true" />
          {showLabel ? <span>{current}</span> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-40">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.name} value={option.name}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
