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
import { DateTimePicker, type DateTimePickerProps } from './DateTimePicker';
import { asDate, useInvalidInputReporter } from './dateInputShared';

/**
 * Props for {@link DateTimeField}. The {@link DateTimePicker} options (`hourCycle`,
 * `minuteStep`, `min`, `max`, ...) are passed to the picker.
 */
export type DateTimeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<
    DateTimePickerProps,
    ControlledInputProp | 'value' | 'onChange' | 'aria-invalid' | 'aria-describedby'
  > & {
    /** Class for the picker itself. */
    inputClassName?: string | undefined;
  };

/**
 * A date-time picker wired to the form. Stores a `Date` (date and time), or `undefined` when
 * empty, so `z.date()` validates it directly.
 *
 * @example
 * ```tsx
 * <DateTimeField name="meeting" label="Meeting" minuteStep={15} />
 * ```
 */
export function DateTimeField<
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
}: DateTimeFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  const { report, clear } = useInvalidInputReporter<TFieldValues, TName>(
    name,
    true,
    onInvalidInput,
  );
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <StackedField label={label} description={description} className={className}>
          <DateTimePicker
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
