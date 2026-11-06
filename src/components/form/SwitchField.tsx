'use client';

import type { JSX } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '../../lib/cn';
import { Switch } from '../basics/Switch';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form';
import { controllerBase, type FieldBaseProps } from './fieldBase';

/** Props for {@link SwitchField}. */
export type SwitchFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues>;

/**
 * A settings-style row: label and description on the left, a switch on the right, wired
 * to the form. Stores `true` or `false`.
 *
 * @example
 * ```tsx
 * <SwitchField name="notifications" label="Notifications" description="Email me about updates." />
 * ```
 */
export function SwitchField<
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
}: SwitchFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-row items-center justify-between gap-4 rounded-lg border p-3 shadow-xs',
            className,
          )}
        >
          <div className="grid gap-1.5">
            <FormLabel>{label}</FormLabel>
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </div>
          <FormControl>
            <Switch
              ref={field.ref}
              name={field.name}
              checked={field.value === true}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              disabled={field.disabled ?? false}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
