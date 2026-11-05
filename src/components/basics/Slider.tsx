'use client';

import { Slider as SliderPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Slider}. `value` and `defaultValue` are arrays: one number per thumb. */
export type SliderProps = ComponentProps<typeof SliderPrimitive.Root>;

/**
 * Pick a number (or a range, with two values) by dragging or with the arrow keys.
 * Give it an `aria-label`.
 *
 * @example
 * ```tsx
 * <Slider defaultValue={[50]} max={100} step={1} aria-label="Volume" />
 * <Slider defaultValue={[20, 80]} aria-label="Price range" />
 * ```
 */
export function Slider({ className, ...props }: SliderProps): JSX.Element {
  const thumbs = Array.from(
    { length: thumbCount(props.value, props.defaultValue) },
    (_, index) => index,
  );
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {thumbs.map((thumb) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={thumb}
          className="block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

/** Number of thumbs to draw: one per value, at least one. @internal */
export function thumbCount(
  value: readonly number[] | undefined,
  defaultValue: readonly number[] | undefined,
): number {
  return Math.max(1, (value ?? defaultValue ?? []).length);
}
