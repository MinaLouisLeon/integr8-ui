import type { Story } from '@ladle/react';
import { z } from 'zod';
import { CheckboxField, useZodForm } from '../../src';
import { DemoForm } from './DemoForm';

const schema = z.object({
  terms: z.literal(true, 'You must accept the terms'),
  updates: z.boolean(),
});

/** "Must accept" with `z.literal(true)`, and a plain optional checkbox. */
export const Default: Story = () => {
  const form = useZodForm(schema, { defaultValues: { updates: false } });
  return (
    <DemoForm form={form}>
      <CheckboxField name="terms" label="I accept the terms" />
      <CheckboxField
        name="updates"
        label="Send me product updates"
        description="About once a month."
      />
    </DemoForm>
  );
};

/** Disabled and checked. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, { defaultValues: { terms: true, updates: true } });
  return (
    <DemoForm form={form}>
      <CheckboxField name="updates" label="Send me product updates" disabled />
    </DemoForm>
  );
};
