import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonStyles } from './Button';

describe('Button', () => {
  it('renders a button with the default variant and size', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button.dataset.slot).toBe('button');
    expect(button.dataset.variant).toBe('default');
    expect(button.className).toContain('bg-primary');
    expect(button.className).toContain('h-9');
  });

  it('applies variant and size classes', () => {
    render(
      <Button variant="destructive" size="icon-sm" aria-label="Delete">
        x
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Delete' });

    expect(button.className).toContain('bg-destructive');
    expect(button.className).toContain('size-8');
    expect(button.dataset.variant).toBe('destructive');
  });

  it('becomes a pill inside the Integr8 theme', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button').className).toContain('in-data-[theme=integr8]:rounded-full');
  });

  it('lets className win over its own classes', () => {
    render(<Button className="px-8">Wide</Button>);
    const { className } = screen.getByRole('button');

    expect(className).toContain('px-8');
    expect(className).not.toMatch(/(^|\s)px-4(\s|$)/);
  });

  it('forwards the ref and handles clicks', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <Button ref={ref} onClick={onClick}>
        Click
      </Button>,
    );

    await userEvent.setup().click(screen.getByRole('button'));

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders its child instead with asChild', () => {
    render(
      <Button asChild variant="outline">
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });

    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.className).toContain('border');
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('buttonStyles', () => {
  it('returns the same classes the Button uses', () => {
    expect(buttonStyles({ variant: 'outline' })).toContain('bg-background');
    expect(buttonStyles()).toContain('bg-primary');
  });
});
