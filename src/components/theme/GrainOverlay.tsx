'use client';

import { type ComponentProps, type CSSProperties, type JSX, useSyncExternalStore } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link GrainOverlay}. */
export type GrainOverlayProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Strength of the grain, from 0 to 1. Default `0.06`. */
  opacity?: number | undefined;
  /** Move the grain like film. Default `false` (still). */
  animated?: boolean | undefined;
  /**
   * `'viewport'` covers the whole window (fixed). `'parent'` fills the nearest positioned
   * parent (absolute), for a hero section or a card. Default `'viewport'`.
   */
  cover?: 'viewport' | 'parent' | undefined;
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getPrefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function getServerPrefersReducedMotion(): boolean {
  return false;
}

/**
 * The integr8-media.com film-grain texture, laid over the page or a section. Decoration only:
 * hidden from screen readers and ignores the pointer.
 *
 * - Shown only in the Integr8 themes; other themes hide it.
 * - Not rendered at all when the user prefers reduced motion.
 * - Opt-in: render it on marketing-style pages, not inside dense tool UIs such as an IDE.
 *
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="integr8">
 *   <GrainOverlay />
 *   <App />
 * </ThemeProvider>
 *
 * <section className="relative">
 *   <GrainOverlay cover="parent" opacity={0.1} />
 * </section>
 * ```
 */
export function GrainOverlay({
  opacity,
  animated = false,
  cover = 'viewport',
  className,
  style,
  ...props
}: GrainOverlayProps): JSX.Element | null {
  const reducedMotion = useSyncExternalStore(
    subscribe,
    getPrefersReducedMotion,
    getServerPrefersReducedMotion,
  );
  if (reducedMotion) return null;

  const vars: Record<string, string> = {};
  if (opacity !== undefined) vars['--grain-opacity'] = String(Math.min(1, Math.max(0, opacity)));
  if (cover === 'parent') vars['--grain-position'] = 'absolute';

  return (
    <div
      aria-hidden="true"
      data-slot="grain-overlay"
      data-cover={cover}
      data-animated={animated ? '' : undefined}
      className={cn(className)}
      style={{ ...vars, ...style } as CSSProperties}
      {...props}
    />
  );
}
