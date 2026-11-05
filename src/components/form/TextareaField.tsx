'use client';

import type { JSX } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Textarea, type TextareaProps } from '../basics/Textarea';
import { FormField } from './Form';
import {
  type ControlledInputProp,
  controllerBase,
  type FieldBaseProps,
  StackedField,
} from './fieldBase';

/** Props for {@link TextareaField}: the shared field props plus native `<textarea>` props. */
export type TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<TextareaProps, ControlledInputProp> & {
    /** Class for the `<textarea>` itself. */
    textareaClassName?: string | undefined;
  };

/**
 * A labelled multi-line text input wired to the form. Stores a string.
 *
 * @example
 * ```tsx
 * <TextareaField name="bio" label="Bio" rows={4} />
 * ```
 */
export function TextareaField<
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
  textareaClassName,
  ...textareaProps
}: TextareaFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <StackedField label={label} description={description} className={className}>
          <Textarea
            {...textareaProps}
            {...field}
            value={field.value ?? ''}
            className={textareaClassName}
          />
        </StackedField>
      )}
    />
  );
}
