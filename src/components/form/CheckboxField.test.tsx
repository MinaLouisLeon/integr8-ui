import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { CheckboxField } from './CheckboxField';
import { renderForm } from './formTestUtils';

const schema = z.object({ terms: z.literal(true, 'You must accept the terms') });

describe('CheckboxField', () => {
  it('toggles from its label and submits true', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <CheckboxField name="terms" label="I accept the terms" description="Required" />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'I accept the terms' });
    expect(checkbox.getAttribute('aria-checked')).toBe('false');

    await user.click(screen.getByText('I accept the terms'));
    expect(checkbox.getAttribute('aria-checked')).toBe('true');

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ terms: true }));
  });

  it('shows the schema error while unchecked', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <CheckboxField name="terms" label="I accept the terms" />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('alert')).textContent).toBe('You must accept the terms');
    expect(screen.getByRole('checkbox').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('starts from the default value and can be disabled', () => {
    renderForm(
      z.object({ news: z.boolean() }),
      <CheckboxField name="news" label="News" disabled />,
      { defaultValues: { news: true } },
    );
    const checkbox = screen.getByRole('checkbox', { name: 'News' }) as HTMLButtonElement;

    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    expect(checkbox.disabled).toBe(true);
  });
});
