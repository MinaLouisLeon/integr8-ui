import { Slot } from 'radix-ui';
import type { ComponentProps, CSSProperties, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link GradientText}. */
export type GradientTextProps = ComponentProps<'span'> & {
  /** Direction of the gradient, any CSS angle. Default `'90deg'` (left to right). */
  angle?: string | undefined;
  /** Render the single child element (for example an `<h1>`) instead of a `<span>`. */
  asChild?: boolean | undefined;
};

/**
 * Text filled with the integr8-media.com gradient: violet → cyan → lime (the `brand-1`,
 * `brand-2` and `brand-3` tokens). Active only in the Integr8 themes; in other themes it is
 * plain text in the current color, so it can stay in place while the user switches themes.
 *
 * @example
 * ```tsx
 * <h1>Build the future, <GradientText>integrated</GradientText>.</h1>
 * <GradientText asChild angle="135deg"><h2>Workbench</h2></GradientText>
 * ```
 */
export function GradientText({
  angle,
  asChild = false,
  className,
  style,
  ...props
}: GradientTextProps): JSX.Element {
  const Comp = asChild ? Slot.Root : 'span';
  return (
    <Comp
      data-slot="gradient-text"
      className={cn(className)}
      style={
        angle === undefined
          ? style
          : ({ ...style, '--gradient-text-angle': angle } as CSSProperties)
      }
      {...props}
    />
  );
}
