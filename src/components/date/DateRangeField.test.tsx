import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { renderForm } from '../form/formTestUtils';
import { DateRangeField } from './DateRangeField';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 6, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

const schema = z.object({
  stay: z.object({ from: z.date(), to: z.date() }, 'Pick the dates of the stay'),
});

const start = () => screen.getByRole('textbox', { name: 'Start date' });
const end = () => screen.getByRole('textbox', { name: 'End date' });

describe('DateRangeField', () => {
  it('shows the label and links it to the first input', () => {
    renderForm(schema, <DateRangeField name="stay" label="Stay" />);

    expect(screen.getByText('Stay')).toBeTruthy();
    expect(screen.getByLabelText('Stay')).toBe(start());
  });

  it('submits the typed range', async () => {
    const { user, onSubmit } = renderForm(schema, <DateRangeField name="stay" label="Stay" />);

    await user.type(start(), '11/02/2026{Enter}');
    await user.type(end(), '11/09/2026{Enter}');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        stay: { from: new Date(2026, 10, 2), to: new Date(2026, 10, 9) },
      }),
    );
  });

  it('reports an empty range with the schema message', async () => {
    const { user, onSubmit } = renderForm(schema, <DateRangeField name="stay" label="Stay" />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('alert')).textContent).toBe('Pick the dates of the stay');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit a half-filled range', async () => {
    const { user, onSubmit } = renderForm(schema, <DateRangeField name="stay" label="Stay" />);

    await user.type(start(), '11/02/2026{Enter}');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // The schema reports the missing "to" on `stay.to`, so the inputs turn red.
    await waitFor(() => expect(end().getAttribute('aria-invalid')).toBe('true'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a "to" before the "from" as the field message', async () => {
    const { user } = renderForm(schema, <DateRangeField name="stay" label="Stay" />, {
      defaultValues: { stay: { from: new Date(2026, 10, 10), to: new Date(2026, 10, 20) } },
    });

    await user.clear(end());
    await user.type(end(), '11/05/2026{Enter}');

    expect((await screen.findByRole('alert')).textContent).toBe('That date is out of range.');
    expect(end().getAttribute('aria-invalid')).toBe('true');
  });

  it('starts with a default value and can use presets', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <DateRangeField
        name="stay"
        label="Stay"
        presets={[
          {
            label: 'Weekend',
            range: () => ({ from: new Date(2026, 10, 7), to: new Date(2026, 10, 8) }),
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('button', { name: 'Weekend' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        stay: { from: new Date(2026, 10, 7), to: new Date(2026, 10, 8) },
      }),
    );
  });
});
