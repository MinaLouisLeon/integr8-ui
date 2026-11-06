import type { Story } from '@ladle/react';
import { z } from 'zod';
import { SelectField, useZodForm } from '../../src';
import { DemoForm } from './DemoForm';

const ROLES = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'manager', label: 'Manager' },
  { value: 'owner', label: 'Owner', disabled: true },
];

const schema = z.object({
  role: z.enum(['developer', 'designer', 'manager', 'owner'], 'Pick a role'),
});

/** A placeholder until something is picked; one option is disabled. */
export const Default: Story = () => {
  const form = useZodForm(schema);
  return (
    <DemoForm form={form}>
      <SelectField
        name="role"
        label="Role"
        placeholder="Pick a role"
        triggerClassName="w-full"
        description="Owners are set by billing."
        options={ROLES}
      />
    </DemoForm>
  );
};

/** Disabled with a value. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, { defaultValues: { role: 'designer' } });
  return (
    <DemoForm form={form}>
      <SelectField name="role" label="Role" options={ROLES} disabled />
    </DemoForm>
  );
};
