import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title as a level-3 heading by default', () => {
    render(<EmptyState title="No projects yet" />);

    const heading = screen.getByRole('heading', { name: 'No projects yet' });
    expect(heading.tagName).toBe('H3');
    expect(heading.dataset.slot).toBe('empty-state-title');
  });

  it('uses the given heading level', () => {
    render(<EmptyState title="Nothing here" headingLevel={2} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Nothing here' })).toBeTruthy();
  });

  it('renders the icon hidden from screen readers, the description and the actions', () => {
    render(
      <EmptyState
        title="No messages"
        description="Messages you receive show up here."
        icon={<svg data-testid="icon" />}
      >
        <button type="button">Compose</button>
      </EmptyState>,
    );

    const icon = screen.getByTestId('icon').parentElement;
    expect(icon?.dataset.slot).toBe('empty-state-icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('Messages you receive show up here.').dataset.slot).toBe(
      'empty-state-description',
    );
    expect(screen.getByRole('button', { name: 'Compose' }).parentElement?.dataset.slot).toBe(
      'empty-state-actions',
    );
  });

  it('leaves out the parts that are not given', () => {
    const { container } = render(<EmptyState title="Empty" />);

    expect(container.querySelector('[data-slot="empty-state-icon"]')).toBeNull();
    expect(container.querySelector('[data-slot="empty-state-description"]')).toBeNull();
    expect(container.querySelector('[data-slot="empty-state-actions"]')).toBeNull();
  });

  it('merges className and supports the outline variant', () => {
    const { container } = render(<EmptyState title="Empty" variant="outline" className="extra" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.dataset.slot).toBe('empty-state');
    expect(root.dataset.variant).toBe('outline');
    expect(root.className).toContain('border-dashed');
    expect(root.className).toContain('extra');
  });
});
