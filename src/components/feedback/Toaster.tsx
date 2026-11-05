'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { type CSSProperties, type JSX, useContext } from 'react';
import {
  type ToasterProps as SonnerProps,
  Toaster as SonnerToaster,
  toast as sonnerToast,
} from 'sonner';
import { cn } from '../../lib/cn';
import { ThemeContext } from '../../theme/themeContext';

/** Props for {@link Toaster}. All sonner `Toaster` props are supported. */
export type ToasterProps = SonnerProps;

/**
 * Shows a toast notification. Call it from anywhere once a {@link Toaster} is mounted.
 * This is sonner's `toast`, so `toast.success()`, `toast.error()`, `toast.warning()`,
 * `toast.info()`, `toast.loading()`, `toast.promise()` and `toast.dismiss()` all work.
 *
 * @example
 * ```tsx
 * toast('Saved');
 * toast.success('Profile updated', { description: 'Your changes are live.' });
 * toast.error('Upload failed', { action: { label: 'Retry', onClick: retry } });
 * toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Could not save' });
 * ```
 */
export const toast: typeof sonnerToast = sonnerToast;

/**
 * The place where {@link toast} notifications appear. Mount it once, near the root of the app.
 * It follows the current theme: colors come from the theme tokens, and inside a
 * `ThemeProvider` it uses the resolved theme's base (light or dark). Outside a provider it
 * follows the OS. Pass `theme` to force one.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 *   <Toaster position="bottom-right" />
 * </ThemeProvider>
 * ```
 */
export function Toaster({
  theme,
  className,
  style,
  icons,
  toastOptions,
  ...props
}: ToasterProps): JSX.Element {
  const themeContext = useContext(ThemeContext);
  const tokenStyle = {
    '--normal-bg': 'var(--popover)',
    '--normal-text': 'var(--popover-foreground)',
    '--normal-border': 'var(--border)',
    '--border-radius': 'var(--radius)',
    ...style,
  } as CSSProperties;

  return (
    <SonnerToaster
      theme={theme ?? themeContext?.base ?? 'system'}
      className={cn('toaster group', className)}
      style={tokenStyle}
      icons={{
        success: <CircleCheckIcon aria-hidden="true" className="size-4 text-success" />,
        info: <InfoIcon aria-hidden="true" className="size-4 text-info" />,
        warning: <TriangleAlertIcon aria-hidden="true" className="size-4 text-warning" />,
        error: <OctagonXIcon aria-hidden="true" className="size-4 text-destructive" />,
        loading: <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin" />,
        ...icons,
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          toast: cn('font-sans', toastOptions?.classNames?.toast),
          description: cn('!text-muted-foreground', toastOptions?.classNames?.description),
        },
      }}
      {...props}
    />
  );
}
