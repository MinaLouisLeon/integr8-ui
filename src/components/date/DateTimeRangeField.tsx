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
import { DateTimeRangePicker, type DateTimeRangePickerProps } from './DateTimeRangePicker';
import { asRange, useInvalidInputReporter } from './dateInputShared';

/**
 * Props for {@link DateTimeRangeField}. The {@link DateTimeRangePicker} options (`presets`,
 * `hourCycle`, `defaultFromTime`, `min`, `max`, ...) are passed to the picker.
 */
export type DateTimeRangeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<
    DateTimeRangePickerProps,
    ControlledInputProp | 'value' | 'onChange' | 'aria-invalid' | 'aria-describedby'
  > & {
    /** Class for the picker itself. */
    inputClassName?: string | undefined;
  };

/**
 * A date-time range picker wired to the form. Stores `{ from, to }` (both `Date`, with times),
 * or `undefined` when empty, so a schema like `z.object({ from: z.date(), to: z.date() })`
 * validates it directly.
 *
 * @example
 * ```tsx
 * <DateTimeRangeField name="shift" label="Shift" minuteStep={15} />
 * ```
 */
export function DateTimeRangeField<
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
}: DateTimeRangeFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
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
          <DateTimeRangePicker
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
