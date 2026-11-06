import type { Story } from '@ladle/react';
import { z } from 'zod';
import { DateTimeField, useZodForm } from '../../src';
import { DemoForm } from '../form/DemoForm';

const schema = z.object({
  meeting: z.date('Pick a time for the meeting'),
  reminder: z.date().optional(),
});

/** Stores a `Date` with the time. Submit empty for the schema message. */
export const Default: Story = () => {
  const form = useZodForm(schema);
  return (
    <DemoForm form={form}>
      <DateTimeField name="meeting" label="Meeting" minuteStep={15} />
      <DateTimeField name="reminder" label="Reminder" hourCycle={24} clearable />
    </DemoForm>
  );
};

/** With a default value. */
export const WithDefaultValue: Story = () => {
  const form = useZodForm(schema, { defaultValues: { meeting: new Date() } });
  return (
    <DemoForm form={form}>
      <DateTimeField name="meeting" label="Meeting" />
    </DemoForm>
  );
};

/** Disabled. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, { defaultValues: { meeting: new Date() } });
  return (
    <DemoForm form={form}>
      <DateTimeField name="meeting" label="Meeting" disabled />
    </DemoForm>
  );
};
