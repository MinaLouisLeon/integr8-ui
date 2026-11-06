import type { Story } from '@ladle/react';
import { z } from 'zod';
import { RadioField, useZodForm } from '../../src';
import { DemoForm } from './DemoForm';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];

const schema = z.object({
  plan: z.enum(['free', 'pro', 'team', 'enterprise'], 'Pick a plan'),
});

/** Vertical (the default); one option is disabled. */
export const Vertical: Story = () => {
  const form = useZodForm(schema);
  return (
    <DemoForm form={form}>
      <RadioField name="plan" label="Plan" description="You can change it later." options={PLANS} />
    </DemoForm>
  );
};

/** In a row. */
export const Horizontal: Story = () => {
  const form = useZodForm(schema, { defaultValues: { plan: 'pro' } });
  return (
    <DemoForm form={form}>
      <RadioField name="plan" label="Plan" orientation="horizontal" options={PLANS} />
    </DemoForm>
  );
};

/** Disabled with a value. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, { defaultValues: { plan: 'team' } });
  return (
    <DemoForm form={form}>
      <RadioField name="plan" label="Plan" options={PLANS} disabled />
    </DemoForm>
  );
};
