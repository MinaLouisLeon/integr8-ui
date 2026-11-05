import { Slot } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link StatusBar}. */
export type StatusBarProps = ComponentProps<'footer'>;

/**
 * The thin bar at the bottom of a tool window (like an editor's status bar). Renders a
 * `<footer>`; give it an `aria-label` when the page has more than one. Holds
 * {@link StatusBarSection}s.
 *
 * Not a live region: wrap a value that changes and must be announced in your own
 * `role="status"` element.
 *
 * @example
 * ```tsx
 * <StatusBar aria-label="Editor status">
 *   <StatusBarSection>
 *     <StatusBarItem><GitBranchIcon /> main</StatusBarItem>
 *   </StatusBarSection>
 *   <StatusBarSection align="end">
 *     <StatusBarItem>Ln 12, Col 4</StatusBarItem>
 *     <StatusBarItem asChild><button type="button">UTF-8</button></StatusBarItem>
 *   </StatusBarSection>
 * </StatusBar>
 * ```
 */
export function StatusBar({ className, ...props }: StatusBarProps): JSX.Element {
  return (
    <footer
      data-slot="status-bar"
      className={cn(
        'flex h-6 w-full shrink-0 items-center gap-2 overflow-hidden border-t bg-card px-1 text-xs text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link StatusBarSection}. */
export type StatusBarSectionProps = ComponentProps<'div'> & {
  /** `'end'` pushes the section to the right end of the bar. Default `'start'`. */
  align?: 'start' | 'end' | undefined;
};

/** A group of {@link StatusBarItem}s at the start or end of the {@link StatusBar}. */
export function StatusBarSection({
  className,
  align = 'start',
  ...props
}: StatusBarSectionProps): JSX.Element {
  return (
    <div
      data-slot="status-bar-section"
      data-align={align}
      className={cn('flex h-full min-w-0 items-center gap-0.5 data-[align=end]:ml-auto', className)}
      {...props}
    />
  );
}

/** Props for {@link StatusBarItem}. */
export type StatusBarItemProps = ComponentProps<'span'> & {
  /**
   * Render the single child element instead of a `<span>`. Use it with a `<button>` or `<a>`
   * for clickable items; they get hover and focus styles.
   */
  asChild?: boolean | undefined;
};

/** One piece of status: text, an icon with text, or (with `asChild`) a button. */
export function StatusBarItem({
  className,
  asChild = false,
  ...props
}: StatusBarItemProps): JSX.Element {
  const Comp = asChild ? Slot.Root : 'span';
  return (
    <Comp
      data-slot="status-bar-item"
      className={cn(
        'inline-flex h-5 min-w-0 items-center gap-1 rounded-sm px-1.5 whitespace-nowrap outline-none',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-3.5',
        '[&:is(a,button)]:cursor-pointer [&:is(a,button)]:hover:bg-muted [&:is(a,button)]:hover:text-foreground',
        '[&:is(a,button)]:focus-visible:ring-2 [&:is(a,button)]:focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
