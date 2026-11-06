'use client';

import type { JSX } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { FormField } from '../form/Form';
import {
  type ControlledInputProp,
  controllerBase,
  type FieldBaseProps,
  StackedField,
} from '../form/fieldBase';
import { DatePicker, type DatePickerProps } from './DatePicker';
import { asDate, useInvalidInputReporter } from './dateInputShared';

/**
 * Props for {@link DateField}. The {@link DatePicker} options (`format`, `clearable`,
 * `fromDate`, `disabledDays`, ...) are passed to the picker.
 */
export type DateFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<
    DatePickerProps,
    ControlledInputProp | 'value' | 'onChange' | 'aria-invalid' | 'aria-describedby'
  > & {
    /** Class for the picker itself. */
    inputClassName?: string | undefined;
  };

/**
 * A date picker wired to the form. Stores a `Date`, or `undefined` when empty, so `z.date()`
 * (or `.optional()`) validates it directly. Typed text that is not accepted shows as the
 * field's message and leaves the stored value as it was.
 *
 * @example
 * ```tsx
 * <DateField name="due" label="Due date" clearable />
 * ```
 */
export function DateField<
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
  onInvalidInput,
  ...pickerProps
}: DateFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  const { report, clear } = useInvalidInputReporter<TFieldValues, TName>(
    name,
    false,
    onInvalidInput,
  );
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <StackedField label={label} description={description} className={className}>
          <DatePicker
            {...pickerProps}
            value={asDate(field.value)}
            onChange={(date) => {
              clear();
              field.onChange(date);
            }}
            onInvalidInput={report}
            onBlur={field.onBlur}
            disabled={field.disabled}
            ref={field.ref}
            className={inputClassName}
          />
        </StackedField>
      )}
    />
  );
}
