'use client';

import { XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Dialog}. */
export type DialogProps = ComponentProps<typeof DialogPrimitive.Root>;

/**
 * A modal window over the page. Focus is trapped inside while it is open and `Esc` closes it.
 * Always give it a {@link DialogTitle} (hide it with `className="sr-only"` if needed).
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild><Button>Edit profile</Button></DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Edit profile</DialogTitle>
 *       <DialogDescription>Changes are saved when you click Save.</DialogDescription>
 *     </DialogHeader>
 *     ...
 *     <DialogFooter><Button>Save</Button></DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export function Dialog(props: DialogProps): JSX.Element {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/** Props for {@link DialogTrigger}. */
export type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>;

/** Opens the {@link Dialog}. Use `asChild` to make your own button the trigger. */
export function DialogTrigger(props: DialogTriggerProps): JSX.Element {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/** Props for {@link DialogPortal}. */
export type DialogPortalProps = ComponentProps<typeof DialogPrimitive.Portal>;

/** Renders its children into `document.body`. {@link DialogContent} already uses it. */
export function DialogPortal(props: DialogPortalProps): JSX.Element {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/** Props for {@link DialogClose}. */
export type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close>;

/** Closes the {@link Dialog}. Use `asChild` to make your own button close it. */
export function DialogClose(props: DialogCloseProps): JSX.Element {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/** Props for {@link DialogOverlay}. */
export type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;

/** The dimmed backdrop behind the dialog. {@link DialogContent} already renders it. */
export function DialogOverlay({ className, ...props }: DialogOverlayProps): JSX.Element {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link DialogContent}. */
export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  /** Show the × button in the top-right corner. Default `true`. */
  showCloseButton?: boolean | undefined;
};

/** The dialog window, centered on the page, with its overlay and close button. */
export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps): JSX.Element {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none sm:max-w-lg',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? <CloseButton slot="dialog-close" /> : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/** The × button shared by Dialog and Sheet. @internal */
export function CloseButton({ slot }: { slot: string }): JSX.Element {
  return (
    <DialogPrimitive.Close
      data-slot={slot}
      className={cn(
        'absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100',
        'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:pointer-events-none data-[state=open]:text-muted-foreground',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      )}
    >
      <XIcon aria-hidden="true" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );
}

/** Props for {@link DialogHeader}. */
export type DialogHeaderProps = ComponentProps<'div'>;

/** Holds the {@link DialogTitle} and {@link DialogDescription}. */
export function DialogHeader({ className, ...props }: DialogHeaderProps): JSX.Element {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

/** Props for {@link DialogFooter}. */
export type DialogFooterProps = ComponentProps<'div'>;

/** The action row at the bottom of the dialog. Stacks on small screens. */
export function DialogFooter({ className, ...props }: DialogFooterProps): JSX.Element {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

/** Props for {@link DialogTitle}. */
export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;

/** The dialog's title, announced by screen readers. Uses the display font in Integr8. */
export function DialogTitle({ className, ...props }: DialogTitleProps): JSX.Element {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

/** Props for {@link DialogDescription}. */
export type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>;

/** Secondary text under the title, announced by screen readers. */
export function DialogDescription({ className, ...props }: DialogDescriptionProps): JSX.Element {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}
