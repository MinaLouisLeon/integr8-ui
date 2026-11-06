import type { Story } from '@ladle/react';
import { z } from 'zod';
import { DateRangeField, rangePresets, useZodForm } from '../../src';
import { DemoForm } from '../form/DemoForm';

const schema = z.object({
  stay: z.object({ from: z.date(), to: z.date() }, 'Pick the dates of the stay'),
});

/** Stores `{ from, to }`. Submit empty or with one end for the schema message. */
export const Default: Story = () => {
  const form = useZodForm(schema);
  return (
    <DemoForm form={form}>
      <DateRangeField name="stay" label="Stay" presets={rangePresets} clearable />
    </DemoForm>
  );
};

/** With a default value. */
export const WithDefaultValue: Story = () => {
  const today = new Date();
  const later = new Date();
  later.setDate(later.getDate() + 3);
  const form = useZodForm(schema, { defaultValues: { stay: { from: today, to: later } } });
  return (
    <DemoForm form={form}>
      <DateRangeField name="stay" label="Stay" />
    </DemoForm>
  );
};

/** Disabled. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, {
    defaultValues: { stay: { from: new Date(), to: new Date() } },
  });
  return (
    <DemoForm form={form}>
      <DateRangeField name="stay" label="Stay" disabled />
    </DemoForm>
  );
};
