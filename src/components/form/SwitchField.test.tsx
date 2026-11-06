import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from './formTestUtils';
import { SwitchField } from './SwitchField';

const schema = z.object({ notifications: z.boolean() });

describe('SwitchField', () => {
  it('renders a named switch with its description', () => {
    renderForm(
      schema,
      <SwitchField name="notifications" label="Notifications" description="Email me" />,
      { defaultValues: { notifications: false } },
    );
    const control = screen.getByRole('switch', { name: 'Notifications' });

    expect(control.getAttribute('aria-checked')).toBe('false');
    expect(control.getAttribute('aria-describedby')).toBe(screen.getByText('Email me').id);
  });

  it('toggles and submits the new value', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <SwitchField name="notifications" label="Notifications" />,
      { defaultValues: { notifications: false } },
    );

    await user.click(screen.getByRole('switch', { name: 'Notifications' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ notifications: true }));
  });

  it('can be disabled', () => {
    renderForm(schema, <SwitchField name="notifications" label="Notifications" disabled />);

    expect(
      (screen.getByRole('switch', { name: 'Notifications' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
