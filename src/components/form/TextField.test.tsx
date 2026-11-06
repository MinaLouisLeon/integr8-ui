import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from './formTestUtils';
import { TextField } from './TextField';

const schema = z.object({ email: z.email('Enter a valid email') });

describe('TextField', () => {
  it('renders a labelled input with native props and a description', () => {
    renderForm(
      schema,
      <TextField
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        description="Work address"
        inputClassName="input-extra"
        className="item-extra"
      />,
      { defaultValues: { email: '' } },
    );
    const input = screen.getByLabelText('Email') as HTMLInputElement;

    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('you@example.com');
    expect(input.className).toContain('input-extra');
    expect(input.closest('[data-slot="form-item"]')?.className).toContain('item-extra');
    expect(screen.getByText('Work address').id).toBe(input.getAttribute('aria-describedby'));
  });

  it('submits what was typed and shows schema errors', async () => {
    const { user, onSubmit } = renderForm(schema, <TextField name="email" label="Email" />, {
      defaultValues: { email: '' },
    });
    const input = screen.getByLabelText('Email');

    await user.type(input, 'nope');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Enter a valid email');

    await user.clear(input);
    await user.type(input, 'ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com' }));
  });

  it('shows an unset value as empty and can be disabled', () => {
    renderForm(
      z.object({ email: z.string().optional() }),
      <TextField name="email" label="Email" disabled />,
    );
    const input = screen.getByLabelText('Email') as HTMLInputElement;

    expect(input.value).toBe('');
    expect(input.disabled).toBe(true);
  });
});
