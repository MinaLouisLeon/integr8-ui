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
import { TimeInput, type TimeInputProps } from './TimeInput';
import type { Time } from './time';

/**
 * Props for {@link TimeField}. `hourCycle`, `showSeconds`, `minuteStep`, `min` and `max` are
 * passed to the {@link TimeInput}.
 */
export type TimeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<TimeInputProps, ControlledInputProp | 'value' | 'onChange'> & {
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
 * A time input wired to the form. Stores a {@link Time} (`{ hours, minutes, seconds? }`), or
 * `undefined` when empty, so a schema like `z.object({ hours: z.number(), minutes: z.number() })`
 * or `.optional()` validates it directly.
 *
 * @example
 * ```tsx
 * <TimeField name="start" label="Start time" hourCycle={24} minuteStep={5} />
 * ```
 */
export function TimeField<
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
  ...inputProps
}: TimeFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <StackedField label={label} description={description} className={className}>
          <TimeInput
            {...inputProps}
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
