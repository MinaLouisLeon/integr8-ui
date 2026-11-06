import type { JSX, ReactElement, ReactNode } from 'react';
import type { Control, ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from './Form';

/**
 * Props shared by every ready field (TextField, SelectField, ...). The field renders its
 * label, control, description and validation message.
 */
export type FieldBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = {
  /** Path of the value in the form, such as `'email'` or `'address.city'`. */
  name: TName;
  /** `form.control`. Optional inside `<Form>`, which provides it. */
  control?: Control<TFieldValues, unknown, TTransformedValues> | undefined;
  /** The visible label. */
  label: ReactNode;
  /** Help text under the control. */
  description?: ReactNode;
  /** Disables the control and leaves the value out of validation. */
  disabled?: boolean | undefined;
  /** Class for the field wrapper (`FormItem`). */
  className?: string | undefined;
};

/** One choice of a {@link SelectField} or {@link RadioField}. */
export interface FieldOption {
  /** The stored value. Must not be an empty string. */
  value: string;
  /** What the user sees. */
  label: ReactNode;
  /** Makes this choice unavailable. */
  disabled?: boolean | undefined;
}

/** Builds the `Controller` props from a field's props, leaving out unset ones. */
export function controllerBase<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues,
>(
  props: Pick<
    FieldBaseProps<TFieldValues, TName, TTransformedValues>,
    'name' | 'control' | 'disabled'
  >,
): Omit<ControllerProps<TFieldValues, TName, TTransformedValues>, 'render'> {
  return {
    name: props.name,
    ...(props.control ? { control: props.control } : {}),
    ...(props.disabled !== undefined ? { disabled: props.disabled } : {}),
  };
}

/** Standard stacked layout: label, control, description, message. Internal. */
export function StackedField({
  label,
  description,
  className,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  className?: string | undefined;
  children: ReactElement;
}): JSX.Element {
  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>{children}</FormControl>
      {description ? <FormDescription>{description}</FormDescription> : null}
      <FormMessage />
    </FormItem>
  );
}

/** Native input props the fields control themselves. */
export type ControlledInputProp =
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onBlur'
  | 'disabled'
  | 'className'
  | 'children'
  | 'ref'
  | 'id';
