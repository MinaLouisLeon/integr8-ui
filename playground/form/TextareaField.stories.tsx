import type { Story } from '@ladle/react';
import { z } from 'zod';
import { TextareaField, useZodForm } from '../../src';
import { DemoForm } from './DemoForm';

const schema = z.object({
  bio: z.string().max(160, 'Keep it under 160 characters').optional(),
  notes: z.string().min(10, 'Write at least 10 characters'),
});

/** An optional field with a limit, and a required one. */
export const Default: Story = () => {
  const form = useZodForm(schema, { defaultValues: { bio: '', notes: '' } });
  return (
    <DemoForm form={form}>
      <TextareaField name="bio" label="Bio" rows={3} description="Optional, 160 characters." />
      <TextareaField
        name="notes"
        label="Release notes"
        rows={5}
        textareaClassName="font-mono text-xs"
      />
    </DemoForm>
  );
};

/** Disabled with a value. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, {
    defaultValues: { bio: 'Designer at Integr8.', notes: 'Locked by the release manager.' },
  });
  return (
    <DemoForm form={form}>
      <TextareaField name="notes" label="Release notes" disabled />
    </DemoForm>
  );
};
