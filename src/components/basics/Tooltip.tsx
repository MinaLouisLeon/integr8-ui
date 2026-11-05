'use client';

import { Tooltip as TooltipPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link TooltipProvider}. */
export type TooltipProviderProps = ComponentProps<typeof TooltipPrimitive.Provider>;

/**
 * Shares open delays between tooltips, so moving from one to the next opens it at once.
 * Optional: each {@link Tooltip} already has its own provider. Default `delayDuration` is 0.
 */
export function TooltipProvider({
  delayDuration = 0,
  ...props
}: TooltipProviderProps): JSX.Element {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

/** Props for {@link Tooltip}. */
export type TooltipProps = ComponentProps<typeof TooltipPrimitive.Root>;

/**
 * A short label shown on hover or keyboard focus. Do not put interactive content in it.
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <Button size="icon" variant="ghost" aria-label="Settings"><SettingsIcon /></Button>
 *   </TooltipTrigger>
 *   <TooltipContent>Settings</TooltipContent>
 * </Tooltip>
 * ```
 */
export function Tooltip(props: TooltipProps): JSX.Element {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

/** Props for {@link TooltipTrigger}. */
export type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger>;

/** The element that shows the tooltip. Use `asChild` with your own button. */
export function TooltipTrigger(props: TooltipTriggerProps): JSX.Element {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/** Props for {@link TooltipContent}. */
export type TooltipContentProps = ComponentProps<typeof TooltipPrimitive.Content>;

/** The tooltip bubble, with an arrow. Default `sideOffset` is 0. */
export function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: TooltipContentProps): JSX.Element {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background',
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
