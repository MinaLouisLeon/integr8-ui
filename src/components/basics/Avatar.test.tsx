import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';

describe('Avatar', () => {
  it('shows the fallback while the image has not loaded', () => {
    // jsdom never loads images, so the fallback stays.
    const { container } = render(
      <Avatar className="size-12">
        <AvatarImage src="/mina.png" alt="Mina" />
        <AvatarFallback>ML</AvatarFallback>
      </Avatar>,
    );
    const avatar = container.querySelector('[data-slot="avatar"]');

    expect(screen.getByText('ML').dataset.slot).toBe('avatar-fallback');
    expect(screen.queryByRole('img')).toBeNull();
    expect(avatar?.className).toContain('size-12');
    expect(avatar?.className).not.toMatch(/(^|\s)size-8(\s|$)/);
  });
});
