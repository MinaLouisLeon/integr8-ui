'use client';

import type { JSX } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Input, type InputProps } from '../basics/Input';
import { FormField } from './Form';
import {
  type ControlledInputProp,
  controllerBase,
  type FieldBaseProps,
  StackedField,
} from './fieldBase';

/** Props for {@link TextField}: the shared field props plus native `<input>` props. */
export type TextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<InputProps, ControlledInputProp> & {
    /** Class for the `<input>` itself. */
    inputClassName?: string | undefined;
  };

/**
 * A labelled text input wired to the form, with description and validation message.
 * Stores a string; an unset value shows as empty.
 *
 * @example
 * ```tsx
 * <TextField control={form.control} name="email" label="Email" type="email" />
 * ```
 */
export function TextField<
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
  inputClassName,
  type = 'text',
  ...inputProps
}: TextFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <StackedField label={label} description={description} className={className}>
          <Input
            type={type}
            {...inputProps}
            {...field}
            value={field.value ?? ''}
            className={inputClassName}
          />
        </StackedField>
      )}
    />
  );
}
