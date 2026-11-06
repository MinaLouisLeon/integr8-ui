import type { Story } from '@ladle/react';
import { z } from 'zod';
import { NumberField, useZodForm } from '../../src';
import { DemoForm } from './DemoForm';

const schema = z.object({
  age: z.number('Enter your age').int('Whole years only').min(13, 'You must be 13 or older'),
  price: z.number('Enter a price').positive('Must be more than 0').optional(),
});

/** Empty text becomes `undefined` and non-numbers become `NaN`, so zod reports them. */
export const Default: Story = () => {
  const form = useZodForm(schema);
  return (
    <DemoForm form={form}>
      <NumberField name="age" label="Age" min={0} step={1} />
      <NumberField
        name="price"
        label="Price"
        step={0.01}
        description="Optional."
        inputClassName="text-right tabular-nums"
      />
    </DemoForm>
  );
};

/** Disabled with a default value. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, { defaultValues: { age: 42 } });
  return (
    <DemoForm form={form}>
      <NumberField name="age" label="Age" disabled />
    </DemoForm>
  );
};
