import type { Story } from '@ladle/react';
import { z } from 'zod';
import { SwitchField, useZodForm } from '../../src';
import { DemoForm } from './DemoForm';

const schema = z.object({
  newsletter: z.boolean(),
  telemetry: z.boolean(),
});

/** Settings rows with the switch on the right. */
export const Default: Story = () => {
  const form = useZodForm(schema, { defaultValues: { newsletter: true, telemetry: false } });
  return (
    <DemoForm form={form}>
      <SwitchField
        name="newsletter"
        label="Newsletter"
        description="One email a month about new releases."
      />
      <SwitchField name="telemetry" label="Usage data" description="Helps us fix bugs faster." />
    </DemoForm>
  );
};

/** Disabled, as when an admin manages the setting. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, { defaultValues: { newsletter: false, telemetry: true } });
  return (
    <DemoForm form={form}>
      <SwitchField
        name="telemetry"
        label="Usage data"
        description="Managed by your admin."
        disabled
      />
    </DemoForm>
  );
};
