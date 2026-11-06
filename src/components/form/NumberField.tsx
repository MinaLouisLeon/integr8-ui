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

/** Props for {@link NumberField}. `min`, `max` and `step` are passed to the input. */
export type NumberFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<InputProps, ControlledInputProp | 'type'> & {
    /** Class for the `<input>` itself. */
    inputClassName?: string | undefined;
  };

/**
 * Converts the text of a number input to the stored value: empty → `undefined`,
 * otherwise a number (`NaN` when the text is not a number, so validation reports it).
 */
export function parseNumberInput(text: string): number | undefined {
  return text.trim() === '' ? undefined : Number(text);
}

/**
 * A number input wired to the form. Stores a `number`, or `undefined` when empty, so a
 * schema like `z.number().min(1)` or `z.number().optional()` validates it directly.
 *
 * @example
 * ```tsx
 * <NumberField name="port" label="Port" min={1} max={65535} />
 * ```
 */
export function NumberField<
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
  inputMode = 'decimal',
  ...inputProps
}: NumberFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <StackedField label={label} description={description} className={className}>
          <Input
            type="number"
            inputMode={inputMode}
            {...inputProps}
            {...field}
            value={typeof field.value === 'number' && !Number.isNaN(field.value) ? field.value : ''}
            onChange={(event) => field.onChange(parseNumberInput(event.target.value))}
            className={inputClassName}
          />
        </StackedField>
      )}
    />
  );
}
