'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { type JSX, useState } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '../../lib/cn';
import { Input, type InputProps } from '../basics/Input';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form';
import { type ControlledInputProp, controllerBase, type FieldBaseProps } from './fieldBase';

/** Props for {@link PasswordField}. */
export type PasswordFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldBaseProps<TFieldValues, TName, TTransformedValues> &
  Omit<InputProps, ControlledInputProp | 'type'> & {
    /** Class for the `<input>` itself. */
    inputClassName?: string | undefined;
    /** Shows the button that reveals the password. Default `true`. */
    showToggle?: boolean | undefined;
    /** Accessible name of the reveal button (it is a toggle button). Default `'Show password'`. */
    toggleLabel?: string | undefined;
  };

/**
 * A password input wired to the form, with a button to show or hide what was typed.
 * Default `autoComplete="current-password"`; use `"new-password"` on sign-up forms.
 *
 * @example
 * ```tsx
 * <PasswordField name="password" label="Password" autoComplete="new-password" />
 * ```
 */
export function PasswordField<
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
  showToggle = true,
  toggleLabel = 'Show password',
  autoComplete = 'current-password',
  ...inputProps
}: PasswordFieldProps<TFieldValues, TName, TTransformedValues>): JSX.Element {
  const [visible, setVisible] = useState(false);
  return (
    <FormField
      {...controllerBase<TFieldValues, TName, TTransformedValues>({ name, control, disabled })}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                autoComplete={autoComplete}
                {...inputProps}
                {...field}
                type={visible ? 'text' : 'password'}
                value={field.value ?? ''}
                className={cn(showToggle && 'pr-10', inputClassName)}
              />
            </FormControl>
            {showToggle ? (
              <button
                type="button"
                data-slot="password-toggle"
                aria-label={toggleLabel}
                aria-pressed={visible}
                disabled={field.disabled}
                onClick={() => setVisible((value) => !value)}
                className={cn(
                  'absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-muted-foreground outline-none transition-colors hover:text-foreground',
                  'focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  'disabled:pointer-events-none disabled:opacity-50',
                )}
              >
                {visible ? (
                  <EyeOffIcon aria-hidden="true" className="size-4" />
                ) : (
                  <EyeIcon aria-hidden="true" className="size-4" />
                )}
              </button>
            ) : null}
          </div>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
