import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders a text input that accepts typing', async () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement;

    await userEvent.setup().type(input, 'Mina');

    expect(input.value).toBe('Mina');
    expect(input.dataset.slot).toBe('input');
  });

  it('passes the type and forwards the ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} type="email" aria-label="Email" />);

    expect(ref.current?.type).toBe('email');
  });

  it('has the error style hook and merges className', () => {
    render(<Input aria-label="X" aria-invalid className="w-40" />);
    const input = screen.getByRole('textbox');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.className).toContain('aria-invalid:border-destructive');
    expect(input.className).toContain('w-40');
    expect(input.className).not.toMatch(/(^|\s)w-full(\s|$)/);
  });
});
