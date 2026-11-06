import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { renderForm } from '../form/formTestUtils';
import { DateField } from './DateField';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 6, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

const schema = z.object({ due: z.date('Pick a date') });
const optionalSchema = z.object({ due: z.date().optional() });

describe('DateField', () => {
  it('links the label to the input', () => {
    renderForm(schema, <DateField name="due" label="Due" />);

    expect(screen.getByLabelText('Due')).toBe(screen.getByRole('textbox'));
  });

  it('shows the description', () => {
    renderForm(schema, <DateField name="due" label="Due" description="When it is due." />);

    expect(screen.getByText('When it is due.')).toBeTruthy();
  });

  it('submits the typed date', async () => {
    const { user, onSubmit } = renderForm(schema, <DateField name="due" label="Due" />);

    await user.type(screen.getByRole('textbox'), '11/06/2026');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ due: new Date(2026, 10, 6) }));
  });

  it('submits a date picked in the calendar', async () => {
    const { user, onSubmit } = renderForm(schema, <DateField name="due" label="Due" />);

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByText('15'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ due: new Date(2026, 10, 15) }));
  });

  it('reports an empty date with the schema message', async () => {
    const { user, onSubmit } = renderForm(schema, <DateField name="due" label="Due" />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('alert')).textContent).toBe('Pick a date');
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows typed text that is not a date as the field message, then clears it', async () => {
    const { user } = renderForm(optionalSchema, <DateField name="due" label="Due" />);

    await user.type(screen.getByRole('textbox'), 'soon');
    await user.tab();

    expect((await screen.findByRole('alert')).textContent).toBe('Enter a valid date.');
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '11/06/2026{Enter}');

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('says so when the day is not available', async () => {
    const { user } = renderForm(
      optionalSchema,
      <DateField name="due" label="Due" disabledDays={{ dayOfWeek: [6] }} />,
    );

    await user.type(screen.getByRole('textbox'), '11/07/2026');
    await user.tab();

    expect((await screen.findByRole('alert')).textContent).toBe('That date is not available.');
  });

  it('calls onInvalidInput as well', async () => {
    const onInvalidInput = vi.fn();
    const { user } = renderForm(
      optionalSchema,
      <DateField name="due" label="Due" onInvalidInput={onInvalidInput} />,
    );

    await user.type(screen.getByRole('textbox'), 'soon');
    await user.tab();

    expect(onInvalidInput).toHaveBeenCalledWith('soon', 'unparseable');
  });

  it('starts with a default value', () => {
    renderForm(schema, <DateField name="due" label="Due" />, {
      defaultValues: { due: new Date(2026, 10, 20) },
    });

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('11/20/2026');
  });

  it('can be disabled', () => {
    renderForm(schema, <DateField name="due" label="Due" disabled />);

    expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(true);
  });
});
