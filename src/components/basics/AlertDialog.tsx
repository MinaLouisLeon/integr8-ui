'use client';

import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';
import { type ButtonVariant, buttonStyles } from './Button';

/** Props for {@link AlertDialog}. */
export type AlertDialogProps = ComponentProps<typeof AlertDialogPrimitive.Root>;

/**
 * A modal that asks the user to confirm or cancel an important action. Unlike {@link Dialog},
 * clicking outside does not close it.
 *
 * @example
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger asChild><Button variant="destructive">Delete</Button></AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Delete the project?</AlertDialogTitle>
 *       <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
 *     </AlertDialogHeader>
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction variant="destructive" onClick={remove}>Delete</AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 * ```
 */
export function AlertDialog(props: AlertDialogProps): JSX.Element {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

/** Props for {@link AlertDialogTrigger}. */
export type AlertDialogTriggerProps = ComponentProps<typeof AlertDialogPrimitive.Trigger>;

/** Opens the {@link AlertDialog}. */
export function AlertDialogTrigger(props: AlertDialogTriggerProps): JSX.Element {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

/** Props for {@link AlertDialogPortal}. */
export type AlertDialogPortalProps = ComponentProps<typeof AlertDialogPrimitive.Portal>;

/** Renders its children into `document.body`. {@link AlertDialogContent} already uses it. */
export function AlertDialogPortal(props: AlertDialogPortalProps): JSX.Element {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

/** Props for {@link AlertDialogOverlay}. */
export type AlertDialogOverlayProps = ComponentProps<typeof AlertDialogPrimitive.Overlay>;

/** The dimmed backdrop. {@link AlertDialogContent} already renders it. */
export function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps): JSX.Element {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link AlertDialogContent}. */
export type AlertDialogContentProps = ComponentProps<typeof AlertDialogPrimitive.Content>;

/** The confirmation window, centered on the page, with its overlay. */
export function AlertDialogContent({ className, ...props }: AlertDialogContentProps): JSX.Element {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none sm:max-w-lg',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

/** Props for {@link AlertDialogHeader}. */
export type AlertDialogHeaderProps = ComponentProps<'div'>;

/** Holds the {@link AlertDialogTitle} and {@link AlertDialogDescription}. */
export function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps): JSX.Element {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

/** Props for {@link AlertDialogFooter}. */
export type AlertDialogFooterProps = ComponentProps<'div'>;

/** The row with the cancel and confirm buttons. Stacks on small screens. */
export function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps): JSX.Element {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

/** Props for {@link AlertDialogTitle}. */
export type AlertDialogTitleProps = ComponentProps<typeof AlertDialogPrimitive.Title>;

/** The question being asked, announced by screen readers. */
export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps): JSX.Element {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

/** Props for {@link AlertDialogDescription}. */
export type AlertDialogDescriptionProps = ComponentProps<typeof AlertDialogPrimitive.Description>;

/** Explains what will happen, announced by screen readers. */
export function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps): JSX.Element {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Props for {@link AlertDialogAction}. */
export type AlertDialogActionProps = ComponentProps<typeof AlertDialogPrimitive.Action> & {
  /** Button style. Default `'default'`; use `'destructive'` for dangerous actions. */
  variant?: ButtonVariant | undefined;
};

/** The confirm button. Closes the dialog after its `onClick` runs. */
export function AlertDialogAction({
  className,
  variant,
  ...props
}: AlertDialogActionProps): JSX.Element {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonStyles({ variant }), className)}
      {...props}
    />
  );
}

/** Props for {@link AlertDialogCancel}. */
export type AlertDialogCancelProps = ComponentProps<typeof AlertDialogPrimitive.Cancel>;

/** The cancel button. Gets focus when the dialog opens. */
export function AlertDialogCancel({ className, ...props }: AlertDialogCancelProps): JSX.Element {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonStyles({ variant: 'outline' }), className)}
      {...props}
    />
  );
}
