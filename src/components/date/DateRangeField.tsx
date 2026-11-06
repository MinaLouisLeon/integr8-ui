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
import { DateRangePicker, type DateRangePickerProps } from './DateRangePicker';
import { asRange, useInvalidInputReporter } from './dateInputShared';

/**
 * Props for {@link DateRangeField}. The {@link DateRangePicker} options (`presets`, `format`,
 * `numberOfMonths`, ...) are passed to the picker.
 */
export type DateRangeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<
    DateRangePickerProps,
    ControlledInputProp | 'value' | 'onChange' | 'aria-invalid' | 'aria-describedby'
  > & {
    /** Class for the picker itself. */
    inputClassName?: string | undefined;
  };

/**
 * A date range picker wired to the form. Stores `{ from, to }` (both `Date`), or `undefined`
 * when empty, so a schema like `z.object({ from: z.date(), to: z.date() })` validates it
 * directly.
 *
 * @example
 * ```tsx
 * <DateRangeField name="stay" label="Stay" presets={rangePresets} />
 * ```
 */
export function DateRangeField<
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
}: DateRangeFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
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
          <DateRangePicker
            {...pickerProps}
            value={asRange(field.value)}
            onChange={(range) => {
              clear();
              field.onChange(range);
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
