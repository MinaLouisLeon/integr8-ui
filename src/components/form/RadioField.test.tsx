import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from './formTestUtils';
import { RadioField } from './RadioField';

const schema = z.object({ plan: z.enum(['monthly', 'yearly'], 'Pick a plan') });
const options = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'lifetime', label: 'Lifetime', disabled: true },
];

describe('RadioField', () => {
  it('names the group by its label and each radio by its option label', () => {
    renderForm(schema, <RadioField name="plan" label="Plan" options={options} />);
    const group = screen.getByRole('radiogroup', { name: 'Plan' });

    expect(group.getAttribute('aria-orientation')).toBe('vertical');
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeTruthy();
    expect((screen.getByRole('radio', { name: 'Lifetime' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('submits the picked value', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <RadioField name="plan" label="Plan" options={options} />,
    );

    await user.click(screen.getByText('Yearly'));
    expect(screen.getByRole('radio', { name: 'Yearly' }).getAttribute('aria-checked')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ plan: 'yearly' }));
  });

  it('shows the schema error when nothing is picked', async () => {
    const { user } = renderForm(schema, <RadioField name="plan" label="Plan" options={options} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('alert')).textContent).toBe('Pick a plan');
    expect(screen.getByRole('radiogroup').getAttribute('aria-invalid')).toBe('true');
  });

  it('supports the horizontal layout', () => {
    renderForm(
      schema,
      <RadioField name="plan" label="Plan" options={options} orientation="horizontal" />,
    );
    const group = screen.getByRole('radiogroup', { name: 'Plan' });

    expect(group.getAttribute('aria-orientation')).toBe('horizontal');
    expect(group.className).toContain('flex');
  });
});
