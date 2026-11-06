import type { Story } from '@ladle/react';
import { z } from 'zod';
import { DateField, useZodForm } from '../../src';
import { DemoForm } from '../form/DemoForm';

const schema = z.object({
  due: z.date('Pick a due date'),
  review: z.date().optional(),
});

/** Stores a `Date`. Submit empty for the schema message; type `soon` for the field message. */
export const Default: Story = () => {
  const form = useZodForm(schema);
  return (
    <DemoForm form={form}>
      <DateField
        name="due"
        label="Due date"
        description="Weekends are not available."
        disabledDays={{ dayOfWeek: [0, 6] }}
      />
      <DateField name="review" label="Review date" clearable />
    </DemoForm>
  );
};

/** With a default value. */
export const WithDefaultValue: Story = () => {
  const form = useZodForm(schema, { defaultValues: { due: new Date() } });
  return (
    <DemoForm form={form}>
      <DateField name="due" label="Due date" />
    </DemoForm>
  );
};

/** Disabled. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, { defaultValues: { due: new Date() } });
  return (
    <DemoForm form={form}>
      <DateField name="due" label="Due date" disabled />
    </DemoForm>
  );
};
