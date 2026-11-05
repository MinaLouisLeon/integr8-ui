import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from './formTestUtils';
import { TextField } from './TextField';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});

describe('useZodForm', () => {
  it('validates with the schema and blocks an invalid submit', async () => {
    const { user, onSubmit } = renderForm(schema, <TextField name="name" label="Name" />, {
      defaultValues: { name: '   ' },
    });

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('alert')).textContent).toBe('Name is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the parsed output of the schema', async () => {
    const { user, onSubmit } = renderForm(schema, <TextField name="name" label="Name" />, {
      defaultValues: { name: '' },
    });

    await user.type(screen.getByLabelText('Name'), '  Ada  ');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' }));
  });

  it('passes the other useForm options through', async () => {
    const { user } = renderForm(schema, <TextField name="name" label="Name" />, {
      defaultValues: { name: 'x' },
      mode: 'onChange',
    });

    await user.clear(screen.getByLabelText('Name'));

    expect((await screen.findByRole('alert')).textContent).toBe('Name is required');
  });
});
