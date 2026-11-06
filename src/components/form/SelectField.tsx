'use client';

import type { JSX, ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../basics/Select';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form';
import { controllerBase, type FieldBaseProps, type FieldOption } from './fieldBase';

/** Props for {@link SelectField}. */
export type SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> & {
  /** The choices, in order. */
  options: readonly FieldOption[];
  /** Text shown while nothing is picked. */
  placeholder?: ReactNode;
  /** Class for the trigger button. */
  triggerClassName?: string | undefined;
};

/**
 * A dropdown wired to the form. Stores the picked option's `value` (a string); an unset
 * value shows the placeholder.
 *
 * @example
 * ```tsx
 * <SelectField
 *   name="role"
 *   label="Role"
 *   placeholder="Pick a role"
 *   options={[{ value: 'admin', label: 'Admin' }, { value: 'member', label: 'Member' }]}
 * />
 * ```
 */
export function SelectField<
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
  options,
  placeholder,
  triggerClassName,
}: SelectFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Select
            name={field.name}
            value={field.value ?? ''}
            onValueChange={field.onChange}
            disabled={field.disabled ?? false}
          >
            <FormControl>
              <SelectTrigger ref={field.ref} onBlur={field.onBlur} className={triggerClassName}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled ?? false}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
