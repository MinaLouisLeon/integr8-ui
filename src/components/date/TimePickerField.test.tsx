import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from '../form/formTestUtils';
import { TimePickerField } from './TimePickerField';

const timeSchema = z.object(
  { hours: z.number(), minutes: z.number(), seconds: z.number().optional() },
  'Pick a time',
);
const schema = z.object({ start: timeSchema });

describe('TimePickerField', () => {
  it('links the label to the first segment', () => {
    renderForm(schema, <TimePickerField name="start" label="Start" hourCycle={24} />);

    expect(screen.getByLabelText('Start')).toBe(screen.getByRole('spinbutton', { name: 'Hours' }));
  });

  it('submits a time picked from the lists', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <TimePickerField name="start" label="Start" hourCycle={24} minuteStep={15} />,
    );

    await user.click(screen.getByRole('button', { name: 'Open time list' }));
    const hours = within(screen.getByRole('group', { name: 'Select hours' }));
    await user.click(hours.getByRole('button', { name: '09' }));
    const minutes = within(screen.getByRole('group', { name: 'Select minutes' }));
    await user.click(minutes.getByRole('button', { name: '30' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ start: { hours: 9, minutes: 30 } }),
    );
  });

  it('submits a typed time', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <TimePickerField name="start" label="Start" hourCycle={24} />,
    );

    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('1445');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ start: { hours: 14, minutes: 45 } }),
    );
  });

  it('reports an empty time with the schema message', async () => {
    const { user, onSubmit } = renderForm(
      schema,
      <TimePickerField name="start" label="Start" hourCycle={24} />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('alert')).textContent).toBe('Pick a time');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('starts with a default value and can be disabled', () => {
    renderForm(schema, <TimePickerField name="start" label="Start" hourCycle={24} disabled />, {
      defaultValues: { start: { hours: 8, minutes: 5 } },
    });

    const hours = screen.getByRole('spinbutton', { name: 'Hours' }) as HTMLInputElement;
    expect(hours.value).toBe('08');
    expect(hours.disabled).toBe(true);
  });
});
