import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { renderForm } from '../form/formTestUtils';
import { DateTimeRangeField } from './DateTimeRangeField';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 6, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

const schema = z.object({
  shift: z.object({ from: z.date(), to: z.date() }, 'Pick the start and end of the shift'),
});

const start = () => screen.getByRole('textbox', { name: 'Start date and time' });
const end = () => screen.getByRole('textbox', { name: 'End date and time' });

describe('DateTimeRangeField', () => {
  it('links the label to the first input', () => {
    renderForm(schema, <DateTimeRangeField name="shift" label="Shift" />);

    expect(screen.getByLabelText('Shift')).toBe(start());
  });

  it('submits the typed range with its times', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <DateTimeRangeField name="shift" label="Shift" />,
    );

    await user.type(start(), '11/02/2026, 9:00 AM{Enter}');
    await user.type(end(), '11/02/2026, 5:30 PM{Enter}');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        shift: { from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 2, 17, 30) },
      }),
    );
  });

  it('shows a "to" earlier than the "from" on the same day as the field message', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <DateTimeRangeField name="shift" label="Shift" />,
      {
        defaultValues: {
          shift: { from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 2, 17, 0) },
        },
      },
    );

    await user.clear(end());
    await user.type(end(), '11/02/2026, 8:00 AM{Enter}');

    expect((await screen.findByRole('alert')).textContent).toBe('That date is out of range.');
    expect(end().getAttribute('aria-invalid')).toBe('true');

    // The stored value is still the last valid range.
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        shift: { from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 2, 17, 0) },
      }),
    );
  });

  it('reports an empty range with the schema message', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <DateTimeRangeField name="shift" label="Shift" />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Pick the start and end of the shift',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('uses the default times for dates only', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <DateTimeRangeField name="shift" label="Shift" />,
    );

    await user.type(start(), '2026-11-02{Enter}');
    await user.type(end(), '2026-11-03{Enter}');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        shift: { from: new Date(2026, 10, 2, 0, 0), to: new Date(2026, 10, 3, 23, 59) },
      }),
    );
  });
});
