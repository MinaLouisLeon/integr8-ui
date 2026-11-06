import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from './formTestUtils';
import { PasswordField } from './PasswordField';

const schema = z.object({ password: z.string().min(8, 'At least 8 characters') });

describe('PasswordField', () => {
  it('hides the text by default and reveals it with the toggle button', async () => {
    const { user } = renderForm(schema, <PasswordField name="password" label="Password" />, {
      defaultValues: { password: '' },
    });
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    const toggle = screen.getByRole('button', { name: 'Show password' });

    expect(input.type).toBe('password');
    expect(input.autocomplete).toBe('current-password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    await user.click(toggle);
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');

    await user.click(toggle);
    expect(input.type).toBe('password');
  });

  it('submits the value and shows schema errors', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <PasswordField name="password" label="Password" autoComplete="new-password" />,
      { defaultValues: { password: '' } },
    );
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.autocomplete).toBe('new-password');

    await user.type(input, 'short');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect((await screen.findByRole('alert')).textContent).toBe('At least 8 characters');

    await user.type(input, '-enough');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ password: 'short-enough' }));
  });

  it('can hide the toggle and rename it', () => {
    const { unmount } = renderForm(
      schema,
      <PasswordField name="password" label="Password" showToggle={false} />,
    );
    expect(screen.queryByRole('button', { name: 'Show password' })).toBeNull();
    unmount();

    renderForm(schema, <PasswordField name="password" label="Password" toggleLabel="Reveal" />);
    expect(screen.getByRole('button', { name: 'Reveal' })).toBeTruthy();
  });
});
