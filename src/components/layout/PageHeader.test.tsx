import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title as a level-1 heading inside a header by default', () => {
    const { container } = render(<PageHeader title="Projects" />);

    const heading = screen.getByRole('heading', { name: 'Projects' });
    expect(heading.tagName).toBe('H1');
    expect(heading.dataset.slot).toBe('page-header-title');
    expect(container.firstElementChild?.tagName).toBe('HEADER');
  });

  it('uses the given heading level', () => {
    render(<PageHeader title="Settings" headingLevel={2} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Settings' })).toBeTruthy();
  });

  it('renders the breadcrumb, description, actions and children', () => {
    render(
      <PageHeader
        title="Projects"
        description="Everything your team is building."
        breadcrumb={<nav aria-label="breadcrumb">Home</nav>}
        actions={<button type="button">New project</button>}
      >
        <div>Tabs here</div>
      </PageHeader>,
    );

    expect(screen.getByRole('navigation').parentElement?.dataset.slot).toBe(
      'page-header-breadcrumb',
    );
    expect(screen.getByText('Everything your team is building.').dataset.slot).toBe(
      'page-header-description',
    );
    expect(screen.getByRole('button', { name: 'New project' }).parentElement?.dataset.slot).toBe(
      'page-header-actions',
    );
    expect(screen.getByText('Tabs here')).toBeTruthy();
  });

  it('leaves out the parts that are not given and merges className', () => {
    const { container } = render(<PageHeader title="Empty" className="extra" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.dataset.slot).toBe('page-header');
    expect(root.className).toContain('extra');
    expect(container.querySelector('[data-slot="page-header-breadcrumb"]')).toBeNull();
    expect(container.querySelector('[data-slot="page-header-description"]')).toBeNull();
    expect(container.querySelector('[data-slot="page-header-actions"]')).toBeNull();
  });
});
