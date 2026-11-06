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
import { TimePicker, type TimePickerProps } from './TimePicker';
import type { Time } from './time';

/**
 * Props for {@link TimePickerField}. `hourCycle`, `showSeconds`, `minuteStep`, `min`, `max`,
 * `align` and `clearable` are passed to the {@link TimePicker}.
 */
export type TimePickerFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<TimePickerProps, ControlledInputProp | 'value' | 'onChange'> & {
    /** Class for the time input itself. */
    inputClassName?: string | undefined;
  };

/** The stored value as a `Time`, or `null` when it is empty or not a time. */
function asTime(value: unknown): Time | null {
  if (typeof value !== 'object' || value === null) return null;
  const { hours, minutes, seconds } = value as Partial<Record<keyof Time, unknown>>;
  if (typeof hours !== 'number' || typeof minutes !== 'number') return null;
  return typeof seconds === 'number' ? { hours, minutes, seconds } : { hours, minutes };
}

/**
 * A time picker wired to the form. Stores a {@link Time} (`{ hours, minutes, seconds? }`), or
 * `undefined` when empty, the same as {@link TimeField}.
 *
 * @example
 * ```tsx
 * <TimePickerField name="start" label="Start time" hourCycle={24} minuteStep={15} />
 * ```
 */
export function TimePickerField<
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
  ...pickerProps
}: TimePickerFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <StackedField label={label} description={description} className={className}>
          <TimePicker
            {...pickerProps}
            value={asTime(field.value)}
            onChange={(time) => field.onChange(time ?? undefined)}
            onBlur={field.onBlur}
            disabled={field.disabled}
            // Lets the form focus the first segment of an invalid field on submit.
            ref={(element) =>
              field.ref(
                element
                  ? { focus: () => element.querySelector<HTMLInputElement>('input')?.focus() }
                  : null,
              )
            }
            className={inputClassName}
          />
        </StackedField>
      )}
    />
  );
}
