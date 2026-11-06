import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { renderForm } from './formTestUtils';
import { TextareaField } from './TextareaField';

const schema = z.object({ bio: z.string().max(10, 'Too long') });

describe('TextareaField', () => {
  it('renders a labelled textarea with native props', () => {
    renderForm(schema, <TextareaField name="bio" label="Bio" rows={4} textareaClassName="extra" />);
    const textarea = screen.getByLabelText('Bio') as HTMLTextAreaElement;

    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.rows).toBe(4);
    expect(textarea.className).toContain('extra');
    expect(textarea.value).toBe('');
  });

  it('submits several lines and shows schema errors', async () => {
    const { user, onSubmit } = renderForm(schema, <TextareaField name="bio" label="Bio" />, {
      defaultValues: { bio: '' },
    });
    const textarea = screen.getByLabelText('Bio');

    await user.type(textarea, 'this is far too long');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Too long');

    await user.clear(textarea);
    await user.type(textarea, 'a{Enter}b');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ bio: 'a\nb' }));
  });
});
