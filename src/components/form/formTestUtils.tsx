// Test helper for the form kit. Not exported from the package.
import { type RenderResult, render } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';
import type { JSX, ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import { type Mock, vi } from 'vitest';
import type { z } from 'zod';
import { Form } from './Form';
import { type UseZodFormOptions, useZodForm } from './useZodForm';

type HarnessProps<TSchema extends z.ZodType<FieldValues, FieldValues>> = {
  schema: TSchema;
  options: UseZodFormOptions<TSchema> | undefined;
  onSubmit: (values: z.output<TSchema>) => void;
  children: ReactNode;
};

function FormHarness<TSchema extends z.ZodType<FieldValues, FieldValues>>({
  schema,
  options,
  onSubmit,
  children,
}: HarnessProps<TSchema>): JSX.Element {
  const form = useZodForm(schema, options);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        {children}
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

/**
 * Renders `ui` inside a `<Form>` built with `useZodForm(schema)` plus a "Submit" button.
 * `onSubmit` receives the parsed values of a valid submit.
 */
export function renderForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  ui: ReactNode,
  options?: UseZodFormOptions<TSchema>,
): RenderFormResult<TSchema> {
  const onSubmit = vi.fn<(values: z.output<TSchema>) => void>();
  const user = userEvent.setup();
  const result = render(
    <FormHarness schema={schema} options={options} onSubmit={onSubmit}>
      {ui}
    </FormHarness>,
  );
  return Object.assign(result, { onSubmit: onSubmit, user: user });
}

/** What {@link renderForm} returns: the render result plus the submit spy and a user. */
export type RenderFormResult<TSchema extends z.ZodType<FieldValues, FieldValues>> = RenderResult & {
  onSubmit: Mock<(values: z.output<TSchema>) => void>;
  user: UserEvent;
};
