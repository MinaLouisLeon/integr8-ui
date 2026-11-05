'use client';

import { cva } from 'class-variance-authority';
import { Dialog as SheetPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';
import { CloseButton } from './Dialog';

/** The screen edge a {@link SheetContent} slides in from. */
export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

const sheetVariants = cva(
  [
    'fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out outline-none',
    'data-[state=open]:animate-in data-[state=open]:duration-500',
    'data-[state=closed]:animate-out data-[state=closed]:duration-300',
  ],
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 h-auto border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right sm:max-w-sm',
        bottom:
          'inset-x-0 bottom-0 h-auto border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

/** Props for {@link Sheet}. */
export type SheetProps = ComponentProps<typeof SheetPrimitive.Root>;

/**
 * A panel that slides in from an edge of the screen. Built on the Radix Dialog, so it traps
 * focus and closes with `Esc`. Always give it a {@link SheetTitle}.
 *
 * @example
 * ```tsx
 * <Sheet>
 *   <SheetTrigger asChild><Button variant="outline">Filters</Button></SheetTrigger>
 *   <SheetContent side="left">
 *     <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
 *     ...
 *   </SheetContent>
 * </Sheet>
 * ```
 */
export function Sheet(props: SheetProps): JSX.Element {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

/** Props for {@link SheetTrigger}. */
export type SheetTriggerProps = ComponentProps<typeof SheetPrimitive.Trigger>;

/** Opens the {@link Sheet}. */
export function SheetTrigger(props: SheetTriggerProps): JSX.Element {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

/** Props for {@link SheetClose}. */
export type SheetCloseProps = ComponentProps<typeof SheetPrimitive.Close>;

/** Closes the {@link Sheet}. */
export function SheetClose(props: SheetCloseProps): JSX.Element {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

/** Props for {@link SheetContent}. */
export type SheetContentProps = ComponentProps<typeof SheetPrimitive.Content> & {
  /** The edge the sheet slides in from. Default `'right'`. */
  side?: SheetSide | undefined;
  /** Show the × button in the top-right corner. Default `true`. */
  showCloseButton?: boolean | undefined;
};

/** The sliding panel, with its overlay and close button. */
export function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetContentProps): JSX.Element {
  return (
    <SheetPrimitive.Portal data-slot="sheet-portal">
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className={cn(
          'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        )}
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {showCloseButton ? <CloseButton slot="sheet-close" /> : null}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

/** Props for {@link SheetHeader}. */
export type SheetHeaderProps = ComponentProps<'div'>;

/** Holds the {@link SheetTitle} and {@link SheetDescription}. */
export function SheetHeader({ className, ...props }: SheetHeaderProps): JSX.Element {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

/** Props for {@link SheetFooter}. */
export type SheetFooterProps = ComponentProps<'div'>;

/** The action row, pushed to the bottom of the sheet. */
export function SheetFooter({ className, ...props }: SheetFooterProps): JSX.Element {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

/** Props for {@link SheetTitle}. */
export type SheetTitleProps = ComponentProps<typeof SheetPrimitive.Title>;

/** The sheet's title, announced by screen readers. */
export function SheetTitle({ className, ...props }: SheetTitleProps): JSX.Element {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  );
}

/** Props for {@link SheetDescription}. */
export type SheetDescriptionProps = ComponentProps<typeof SheetPrimitive.Description>;

/** Secondary text under the title, announced by screen readers. */
export function SheetDescription({ className, ...props }: SheetDescriptionProps): JSX.Element {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}
