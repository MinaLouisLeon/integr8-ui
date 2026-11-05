import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders a textarea that accepts typing', async () => {
    render(<Textarea aria-label="Comment" className="min-h-32" />);
    const textarea = screen.getByRole('textbox', { name: 'Comment' }) as HTMLTextAreaElement;

    await userEvent.setup().type(textarea, 'Hello');

    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.value).toBe('Hello');
    expect(textarea.dataset.slot).toBe('textarea');
    expect(textarea.className).toContain('min-h-32');
    expect(textarea.className).not.toMatch(/(^|\s)min-h-16(\s|$)/);
  });
});
