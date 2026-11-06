import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from './formTestUtils';
import { NumberField, parseNumberInput } from './NumberField';

describe('parseNumberInput', () => {
  it('turns empty text into undefined and other text into a number', () => {
    expect(parseNumberInput('')).toBeUndefined();
    expect(parseNumberInput('  ')).toBeUndefined();
    expect(parseNumberInput('42')).toBe(42);
    expect(parseNumberInput('-1.5')).toBe(-1.5);
    expect(parseNumberInput('abc')).toBeNaN();
  });
});

describe('NumberField', () => {
  const schema = z.object({ port: z.number('Enter a number').min(1, 'At least 1') });

  it('renders a number input with min, max and step', () => {
    renderForm(schema, <NumberField name="port" label="Port" min={1} max={65535} step={1} />);
    const input = screen.getByLabelText('Port') as HTMLInputElement;

    expect(input.type).toBe('number');
    expect(input.inputMode).toBe('decimal');
    expect(input.min).toBe('1');
    expect(input.max).toBe('65535');
    expect(input.value).toBe('');
  });

  it('submits a number', async () => {
    const { user, onSubmit } = renderForm(schema, <NumberField name="port" label="Port" />);

    await user.type(screen.getByLabelText('Port'), '8080');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ port: 8080 }));
  });

  it('reports an empty or out-of-range value', async () => {
    const { user, onSubmit } = renderForm(schema, <NumberField name="port" label="Port" />);
    const input = screen.getByLabelText('Port');

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Enter a number');

    await user.type(input, '0');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('At least 1'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the default value', () => {
    renderForm(schema, <NumberField name="port" label="Port" />, {
      defaultValues: { port: 3000 },
    });

    expect((screen.getByLabelText('Port') as HTMLInputElement).value).toBe('3000');
  });
});
