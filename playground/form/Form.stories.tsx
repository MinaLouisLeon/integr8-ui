import type { Story } from '@ladle/react';
import { useState } from 'react';
import { z } from 'zod';
import {
  Button,
  CheckboxField,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  NumberField,
  PasswordField,
  RadioField,
  SelectField,
  SwitchField,
  TextareaField,
  TextField,
  useZodForm,
} from '../../src';

const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  age: z.number('Enter your age').int('Whole years only').min(13, 'You must be 13 or older'),
  role: z.enum(['developer', 'designer', 'manager'], 'Pick a role'),
  plan: z.enum(['free', 'pro', 'team'], 'Pick a plan'),
  bio: z.string().max(160, 'Keep it under 160 characters').optional(),
  newsletter: z.boolean(),
  terms: z.literal(true, 'You must accept the terms'),
});

/** Every ready field in one sign-up form. Submit empty to see the messages. */
export const AllFields: Story = () => {
  const [result, setResult] = useState<string>('');
  const form = useZodForm(signUpSchema, {
    defaultValues: { name: '', email: '', password: '', bio: '', newsletter: true },
  });
  return (
    <Form {...form}>
      <form
        noValidate
        className="grid max-w-md gap-6"
        onSubmit={form.handleSubmit((values) => setResult(JSON.stringify(values, null, 2)))}
      >
        <TextField name="name" label="Name" autoComplete="name" />
        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          description="We never share it."
        />
        <PasswordField name="password" label="Password" autoComplete="new-password" />
        <NumberField name="age" label="Age" min={0} step={1} />
        <SelectField
          name="role"
          label="Role"
          placeholder="Pick a role"
          triggerClassName="w-full"
          options={[
            { value: 'developer', label: 'Developer' },
            { value: 'designer', label: 'Designer' },
            { value: 'manager', label: 'Manager' },
          ]}
        />
        <RadioField
          name="plan"
          label="Plan"
          orientation="horizontal"
          options={[
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
            { value: 'team', label: 'Team' },
          ]}
        />
        <TextareaField name="bio" label="Bio" rows={3} description="Optional, 160 characters." />
        <SwitchField
          name="newsletter"
          label="Newsletter"
          description="One email a month about new releases."
        />
        <CheckboxField name="terms" label="I accept the terms" />
        <div className="flex gap-2">
          <Button type="submit">Create account</Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
        {result ? <pre className="rounded-md bg-muted p-3 font-mono text-xs">{result}</pre> : null}
      </form>
    </Form>
  );
};

const settingsSchema = z.object({
  host: z.string().min(1, 'Required'),
  port: z.number('Enter a port').min(1).max(65535),
  telemetry: z.boolean(),
});

/** Disabled fields and default values, as on a read-only settings page. */
export const DisabledAndDefaults: Story = () => {
  const form = useZodForm(settingsSchema, {
    defaultValues: { host: 'localhost', port: 8080, telemetry: false },
  });
  return (
    <Form {...form}>
      <form className="grid max-w-md gap-6">
        <TextField name="host" label="Host" disabled />
        <NumberField name="port" label="Port" disabled />
        <SwitchField
          name="telemetry"
          label="Telemetry"
          description="Managed by your admin."
          disabled
        />
      </form>
    </Form>
  );
};

const handleSchema = z.object({
  handle: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only')
    .min(3, 'At least 3 characters'),
});

/** The low-level parts, for a custom control. Validates as you type. */
export const CustomField: Story = () => {
  const form = useZodForm(handleSchema, { defaultValues: { handle: '' }, mode: 'onChange' });
  return (
    <Form {...form}>
      <form className="grid max-w-md gap-6" onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handle</FormLabel>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">integr8.app/</span>
                <FormControl>
                  <Input {...field} placeholder="your-name" />
                </FormControl>
              </div>
              <FormDescription>Your public profile address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
