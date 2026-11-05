import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Textarea}. All native `<textarea>` props are supported. */
export type TextareaProps = ComponentProps<'textarea'>;

/**
 * A multi-line text field that grows with its content (in browsers that support
 * `field-sizing`). Set `aria-invalid` to show the error style.
 *
 * @example
 * ```tsx
 * <Textarea placeholder="Write a comment" rows={3} />
 * ```
 */
export function Textarea({ className, ...props }: TextareaProps): JSX.Element {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm dark:bg-input/30',
        'placeholder:text-muted-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}
