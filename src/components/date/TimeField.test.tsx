import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from '../form/formTestUtils';
import { TimeField } from './TimeField';

const timeSchema = z.object(
  { hours: z.number(), minutes: z.number(), seconds: z.number().optional() },
  'Pick a time',
);

describe('TimeField', () => {
  const schema = z.object({ start: timeSchema });
  const optionalSchema = z.object({ start: timeSchema.optional() });

  it('links the label to the first segment', () => {
    renderForm(schema, <TimeField name="start" label="Start" hourCycle={24} />);

    expect(screen.getByLabelText('Start')).toBe(screen.getByRole('spinbutton', { name: 'Hours' }));
  });

  it('submits the typed time', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <TimeField name="start" label="Start" hourCycle={24} />,
    );

    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('0930');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ start: { hours: 9, minutes: 30 } }),
    );
  });

  it('submits seconds when they are shown', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <TimeField name="start" label="Start" hourCycle={24} showSeconds />,
    );

    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('081500');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ start: { hours: 8, minutes: 15, seconds: 0 } }),
    );
  });

  it('reports an empty or incomplete time', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <TimeField name="start" label="Start" hourCycle={24} />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Pick a time');
    expect(screen.getByRole('spinbutton', { name: 'Hours' }).getAttribute('aria-invalid')).toBe(
      'true',
    );

    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('09');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Pick a time'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('accepts an empty optional field', async () => {
    const { user, onSubmit } = renderForm(
      optionalSchema,
      <TimeField name="start" label="Start" hourCycle={24} />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ start: undefined }));
  });

  it('shows the default value', () => {
    renderForm(schema, <TimeField name="start" label="Start" hourCycle={12} />, {
      defaultValues: { start: { hours: 14, minutes: 5 } },
    });

    expect((screen.getByRole('spinbutton', { name: 'Hours' }) as HTMLInputElement).value).toBe(
      '02',
    );
    expect((screen.getByRole('spinbutton', { name: 'AM/PM' }) as HTMLInputElement).value).toBe(
      'PM',
    );
  });

  it('clears the stored value when a segment is cleared', async () => {
    const { user, onSubmit } = renderForm(
      optionalSchema,
      <TimeField name="start" label="Start" hourCycle={24} />,
      { defaultValues: { start: { hours: 14, minutes: 5 } } },
    );

    await user.click(screen.getByRole('spinbutton', { name: 'Minutes' }));
    await user.keyboard('{Backspace}');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ start: undefined }));
  });

  it('disables the segments and shows the description', () => {
    renderForm(
      schema,
      <TimeField name="start" label="Start" hourCycle={24} disabled description="Local time." />,
    );

    expect((screen.getByRole('spinbutton', { name: 'Hours' }) as HTMLInputElement).disabled).toBe(
      true,
    );
    expect(screen.getByText('Local time.')).toBeTruthy();
  });
});
