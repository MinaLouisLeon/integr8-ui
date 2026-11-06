// Shared wrapper for the per-field stories (not a story file itself).
import { type ReactNode, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { Button, Form } from '../../src';

/**
 * Wraps fields in a `<Form>`, with Submit and Reset buttons. Shows the parsed values after a
 * valid submit. Submit empty to see the schema's messages.
 */
export function DemoForm<TFieldValues extends FieldValues, TTransformed>({
  form,
  children,
}: {
  form: UseFormReturn<TFieldValues, unknown, TTransformed>;
  children: ReactNode;
}): ReactNode {
  const [result, setResult] = useState('');
  return (
    <Form {...form}>
      <form
        noValidate
        className="grid max-w-md gap-6"
        onSubmit={form.handleSubmit((values) => setResult(JSON.stringify(values, null, 2)))}
      >
        {children}
        <div className="flex gap-2">
          <Button type="submit">Submit</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setResult('');
            }}
          >
            Reset
          </Button>
        </div>
        {result ? <pre className="rounded-md bg-muted p-3 font-mono text-xs">{result}</pre> : null}
      </form>
    </Form>
  );
}
