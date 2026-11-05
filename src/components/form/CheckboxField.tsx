'use client';

import type { JSX } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '../../lib/cn';
import { Checkbox } from '../basics/Checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form';
import { controllerBase, type FieldBaseProps } from './fieldBase';

/** Props for {@link CheckboxField}. */
export type CheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues>;

/**
 * A checkbox with its label beside it, wired to the form. Stores `true` or `false`.
 * Use `z.literal(true)` in the schema for "must accept" checkboxes.
 *
 * @example
 * ```tsx
 * <CheckboxField name="terms" label="I accept the terms" />
 * ```
 */
export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
  description,
  disabled,
  className,
}: CheckboxFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-start gap-3', className)}>
          <FormControl>
            <Checkbox
              ref={field.ref}
              name={field.name}
              checked={field.value === true}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              disabled={field.disabled ?? false}
            />
          </FormControl>
          <div className="grid gap-1.5 leading-none">
            <FormLabel>{label}</FormLabel>
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
