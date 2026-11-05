import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from './formTestUtils';
import { SelectField } from './SelectField';

const schema = z.object({ role: z.enum(['admin', 'member'], 'Pick a role') });
const options = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'guest', label: 'Guest', disabled: true },
];

describe('SelectField', () => {
  it('shows the placeholder and is named by its label', () => {
    renderForm(
      schema,
      <SelectField name="role" label="Role" placeholder="Pick a role" options={options} />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Role' });

    expect(trigger.textContent).toContain('Pick a role');
    expect(trigger.getAttribute('aria-invalid')).toBe('false');
  });

  it('submits the picked value', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <SelectField name="role" label="Role" options={options} />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Role' });

    trigger.focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    expect(screen.getByRole('option', { name: 'Guest' }).getAttribute('aria-disabled')).toBe(
      'true',
    );
    await user.click(screen.getByRole('option', { name: 'Member' }));
    expect(trigger.textContent).toContain('Member');

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ role: 'member' }));
  });

  it('shows the schema error when nothing is picked', async () => {
    const { user } = renderForm(schema, <SelectField name="role" label="Role" options={options} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('alert')).textContent).toBe('Pick a role');
    expect(screen.getByRole('combobox', { name: 'Role' }).getAttribute('aria-invalid')).toBe(
      'true',
    );
  });

  it('can be disabled', () => {
    renderForm(schema, <SelectField name="role" label="Role" options={options} disabled />);

    expect((screen.getByRole('combobox', { name: 'Role' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});
