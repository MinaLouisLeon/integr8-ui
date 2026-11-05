import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Input } from '../basics/Input';
import {
  Form,
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from './Form';
import { renderForm } from './formTestUtils';

const schema = z.object({ email: z.string().min(1, 'Email is required') });

function EmailField({ hint }: { hint?: string }) {
  return (
    <FormField
      name="email"
      render={({ field }) => (
        <FormItem className="extra">
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Work address</FormDescription>
          <FormMessage>{hint}</FormMessage>
        </FormItem>
      )}
    />
  );
}

function Orphan() {
  useFormField();
  return null;
}

function OrphanHarness() {
  const form = useForm();
  return (
    <Form {...form}>
      <Orphan />
    </Form>
  );
}

describe('Form parts', () => {
  it('links the label, the control and the description', () => {
    const { container } = renderForm(schema, <EmailField />, { defaultValues: { email: '' } });
    const input = screen.getByLabelText('Email');
    const description = screen.getByText('Work address');

    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(input.getAttribute('aria-describedby')).toBe(description.id);
    expect(description.dataset.slot).toBe('form-description');
    expect(container.querySelector('[data-slot="form-item"]')?.className).toContain('extra');
  });

  it('shows the validation message and marks the field invalid', async () => {
    const { user, onSubmit } = renderForm(schema, <EmailField />, {
      defaultValues: { email: '' },
    });

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const message = await screen.findByRole('alert');
    const input = screen.getByLabelText('Email');
    expect(message.textContent).toBe('Email is required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(message.id);
    expect(screen.getByText('Email').dataset.error).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows FormMessage children while the field is valid, and nothing without them', () => {
    const { unmount } = renderForm(schema, <EmailField hint="We never share it" />, {
      defaultValues: { email: '' },
    });
    const hint = screen.getByText('We never share it');
    expect(hint.dataset.slot).toBe('form-message');
    expect(hint.getAttribute('role')).toBeNull();
    unmount();

    const { container } = renderForm(schema, <EmailField />, { defaultValues: { email: '' } });
    expect(container.querySelector('[data-slot="form-message"]')).toBeNull();
  });

  it('throws a FormError when a part is used outside FormField', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    let caught: unknown;
    try {
      render(<OrphanHarness />);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(FormError);
    expect((caught as FormError).code).toBe('NO_FORM_FIELD');
    vi.restoreAllMocks();
  });
});
