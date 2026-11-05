'use client';

import { Slot as SlotPrimitive } from 'radix-ui';
import { type ComponentProps, createContext, type JSX, useContext, useId } from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { cn } from '../../lib/cn';
import { Label } from '../basics/Label';

/**
 * The form root: react-hook-form's `FormProvider`. Pass the object returned by
 * `useZodForm()` (or `useForm()`) as props, then render a `<form>` inside.
 *
 * @example
 * ```tsx
 * const form = useZodForm(schema);
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(save)}>...</form>
 * </Form>
 * ```
 */
export const Form: typeof FormProvider = FormProvider;

type FormFieldContextValue = { name: string };
const FormFieldContext = createContext<FormFieldContextValue | null>(null);

type FormItemContextValue = { id: string };
const FormItemContext = createContext<FormItemContextValue | null>(null);

/**
 * Props for {@link FormField}: all react-hook-form `Controller` props. `TTransformedValues`
 * is the parsed type a resolver (such as zod in {@link useZodForm}) hands to submit.
 */
export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = ControllerProps<TFieldValues, TName, TTransformedValues>;

/**
 * Connects one field of the form to its controls. Wraps react-hook-form's `Controller` and
 * tells the `Form*` parts inside which field they belong to.
 *
 * @example
 * ```tsx
 * <FormField
 *   control={form.control}
 *   name="email"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>Email</FormLabel>
 *       <FormControl><Input {...field} /></FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 * ```
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: FormFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

/**
 * Returns the ids, name and validation state of the surrounding field. Must be used inside
 * `FormField` and `FormItem`.
 */
export function useFormField(): {
  id: string;
  name: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  invalid: boolean;
  error: { message?: string | undefined } | undefined;
} {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  if (!fieldContext) {
    throw new FormError('NO_FORM_FIELD', 'useFormField must be used inside <FormField>.');
  }
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  const id = itemContext?.id ?? fieldContext.name;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    invalid: fieldState.invalid,
    error: fieldState.error,
  };
}

/** Error codes thrown by the form kit. */
export type FormErrorCode = 'NO_FORM_FIELD';

/** Thrown when a form part is used outside the component it needs. */
export class FormError extends Error {
  /** A stable code for the error. */
  readonly code: FormErrorCode;
  constructor(code: FormErrorCode, message: string) {
    super(message);
    this.name = 'FormError';
    this.code = code;
  }
}

/** Props for {@link FormItem}. */
export type FormItemProps = ComponentProps<'div'>;

/** Groups the label, control, description and message of one field. */
export function FormItem({ className, ...props }: FormItemProps): JSX.Element {
  const id = useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn('grid gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

/** Props for {@link FormLabel}. */
export type FormLabelProps = ComponentProps<typeof Label>;

/** The field's label, linked to the control; turns `destructive` when the field is invalid. */
export function FormLabel({ className, ...props }: FormLabelProps): JSX.Element {
  const { invalid, formItemId } = useFormField();
  return (
    <Label
      data-slot="form-label"
      data-error={invalid}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/** Props for {@link FormControl}. */
export type FormControlProps = ComponentProps<typeof SlotPrimitive.Slot>;

/** Passes the id and the `aria-*` wiring to the single control inside it. */
export function FormControl(props: FormControlProps): JSX.Element {
  const { invalid, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <SlotPrimitive.Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={invalid ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={invalid}
      {...props}
    />
  );
}

/** Props for {@link FormDescription}. */
export type FormDescriptionProps = ComponentProps<'p'>;

/** Help text under the control. */
export function FormDescription({ className, ...props }: FormDescriptionProps): JSX.Element {
  const { formDescriptionId } = useFormField();
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Props for {@link FormMessage}. */
export type FormMessageProps = ComponentProps<'p'>;

/** The validation message of the field, or `children` when the field is valid. */
export function FormMessage({
  className,
  children,
  ...props
}: FormMessageProps): JSX.Element | null {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : children;
  if (!body) return null;
  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      role={error ? 'alert' : undefined}
      className={cn('text-sm text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
}
