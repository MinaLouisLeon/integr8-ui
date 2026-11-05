'use client';

import { type JSX, useId } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '../../lib/cn';
import { Label } from '../basics/Label';
import { RadioGroup, RadioGroupItem } from '../basics/RadioGroup';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form';
import { controllerBase, type FieldBaseProps, type FieldOption } from './fieldBase';

/** Props for {@link RadioField}. */
export type RadioFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> & {
  /** The choices, in order. */
  options: readonly FieldOption[];
  /** `'horizontal'` lays the choices out in a row. Default `'vertical'`. */
  orientation?: 'vertical' | 'horizontal' | undefined;
};

/**
 * A group of radio buttons wired to the form; the label names the group. Stores the picked
 * option's `value` (a string).
 *
 * @example
 * ```tsx
 * <RadioField
 *   name="plan"
 *   label="Plan"
 *   options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]}
 * />
 * ```
 */
export function RadioField<
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
  orientation = 'vertical',
}: RadioFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  const baseId = useId();
  const labelId = `${baseId}-label`;
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel id={labelId}>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              ref={field.ref}
              name={field.name}
              aria-labelledby={labelId}
              value={field.value ?? ''}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              disabled={field.disabled ?? false}
              orientation={orientation}
              className={cn(orientation === 'horizontal' && 'flex flex-wrap gap-4')}
            >
              {options.map((option) => {
                const itemId = `${baseId}-${option.value}`;
                return (
                  <div key={option.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      id={itemId}
                      value={option.value}
                      disabled={option.disabled ?? false}
                    />
                    <Label htmlFor={itemId} className="font-normal">
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
