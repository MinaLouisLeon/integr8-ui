import type { Story } from '@ladle/react';
import { z } from 'zod';
import { DateTimeRangeField, rangePresets, useZodForm } from '../../src';
import { DemoForm } from '../form/DemoForm';

const schema = z.object({
  shift: z.object({ from: z.date(), to: z.date() }, 'Pick the start and end of the shift'),
});

/** Stores `{ from, to }` with times. A "to" before the "from" shows the field message. */
export const Default: Story = () => {
  const form = useZodForm(schema);
  return (
    <div className="max-w-2xl">
      <DemoForm form={form}>
        <DateTimeRangeField
          name="shift"
          label="Shift"
          minuteStep={15}
          presets={rangePresets}
          clearable
        />
      </DemoForm>
    </div>
  );
};

/** With a default value. */
export const WithDefaultValue: Story = () => {
  const from = new Date();
  from.setHours(9, 0, 0, 0);
  const to = new Date();
  to.setHours(17, 0, 0, 0);
  const form = useZodForm(schema, { defaultValues: { shift: { from, to } } });
  return (
    <div className="max-w-2xl">
      <DemoForm form={form}>
        <DateTimeRangeField name="shift" label="Shift" hourCycle={24} />
      </DemoForm>
    </div>
  );
};

/** Disabled. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, {
    defaultValues: { shift: { from: new Date(), to: new Date() } },
  });
  return (
    <div className="max-w-2xl">
      <DemoForm form={form}>
        <DateTimeRangeField name="shift" label="Shift" disabled />
      </DemoForm>
    </div>
  );
};
