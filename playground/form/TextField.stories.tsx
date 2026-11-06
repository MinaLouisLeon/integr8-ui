import type { Story } from '@ladle/react';
import { z } from 'zod';
import { TextField, useZodForm } from '../../src';
import { DemoForm } from './DemoForm';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Enter a valid email'),
  website: z.url('Enter a full URL').optional().or(z.literal('')),
});

/** Text, email and URL inputs with a description and schema messages. */
export const Default: Story = () => {
  const form = useZodForm(schema, { defaultValues: { name: '', email: '', website: '' } });
  return (
    <DemoForm form={form}>
      <TextField name="name" label="Name" autoComplete="name" />
      <TextField
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        description="We never share it."
      />
      <TextField name="website" label="Website" type="url" inputClassName="font-mono" />
    </DemoForm>
  );
};

/** Disabled with a value. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, {
    defaultValues: { name: 'Ada Lovelace', email: 'ada@example.com', website: '' },
  });
  return (
    <DemoForm form={form}>
      <TextField name="name" label="Name" disabled />
    </DemoForm>
  );
};
