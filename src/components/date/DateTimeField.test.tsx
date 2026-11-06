import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { renderForm } from '../form/formTestUtils';
import { DateTimeField } from './DateTimeField';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 6, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

const schema = z.object({ meeting: z.date('Pick a time for the meeting') });

describe('DateTimeField', () => {
  it('links the label to the input', () => {
    renderForm(schema, <DateTimeField name="meeting" label="Meeting" />);

    expect(screen.getByLabelText('Meeting')).toBe(screen.getByRole('textbox'));
  });

  it('submits the typed date and time', async () => {
    const { user, onSubmit } = renderForm(schema, <DateTimeField name="meeting" label="Meeting" />);

    await user.type(screen.getByRole('textbox'), '11/06/2026, 3:30 PM');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ meeting: new Date(2026, 10, 6, 15, 30) }),
    );
  });

  it('submits the moment set with Now', async () => {
    const { user, onSubmit } = renderForm(schema, <DateTimeField name="meeting" label="Meeting" />);

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('button', { name: 'Now' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ meeting: new Date(2026, 10, 6, 12, 0) }),
    );
  });

  it('reports an empty value with the schema message', async () => {
    const { user, onSubmit } = renderForm(schema, <DateTimeField name="meeting" label="Meeting" />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('alert')).textContent).toBe('Pick a time for the meeting');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows unreadable text as the field message', async () => {
    const { user } = renderForm(schema, <DateTimeField name="meeting" label="Meeting" />);

    await user.type(screen.getByRole('textbox'), 'tomorrow');
    await user.tab();

    expect((await screen.findByRole('alert')).textContent).toBe('Enter a valid date and time.');
  });

  it('passes time options to the picker', async () => {
    renderForm(schema, <DateTimeField name="meeting" label="Meeting" hourCycle={24} />, {
      defaultValues: { meeting: new Date(2026, 10, 6, 15, 30) },
    });

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('11/06/2026, 15:30');
  });
});
