import type { Story } from '@ladle/react';
import { z } from 'zod';
import { PasswordField, useZodForm } from '../../src';
import { DemoForm } from './DemoForm';

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters'),
});

/** With the show/hide toggle (the default). */
export const Default: Story = () => {
  const form = useZodForm(schema, { defaultValues: { password: '' } });
  return (
    <DemoForm form={form}>
      <PasswordField
        name="password"
        label="Password"
        autoComplete="new-password"
        description="At least 8 characters."
      />
    </DemoForm>
  );
};

/** No toggle, and a translated toggle label on a second field. */
export const ToggleOptions: Story = () => {
  const form = useZodForm(schema, { defaultValues: { password: 'correct horse' } });
  return (
    <DemoForm form={form}>
      <PasswordField name="password" label="Without toggle" showToggle={false} />
      <PasswordField name="password" label="Passwort" toggleLabel="Passwort anzeigen" />
    </DemoForm>
  );
};
