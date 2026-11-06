import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from './Toolbar';

function Formatting({ orientation }: { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <Toolbar aria-label="Formatting" orientation={orientation} className="extra">
      <ToolbarToggleGroup type="multiple" aria-label="Text style">
        <ToolbarToggleItem value="bold" aria-label="Bold">
          B
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" aria-label="Italic">
          I
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton>Share</ToolbarButton>
      <ToolbarLink href="#help">Help</ToolbarLink>
    </Toolbar>
  );
}

describe('Toolbar', () => {
  it('renders a labelled toolbar with its parts', () => {
    const { container } = render(<Formatting />);

    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(toolbar.dataset.slot).toBe('toolbar');
    expect(toolbar.className).toContain('extra');
    expect(screen.getByRole('button', { name: 'Share' }).dataset.slot).toBe('toolbar-button');
    expect(screen.getByRole('link', { name: 'Help' }).dataset.slot).toBe('toolbar-link');
    const separator = container.querySelector('[data-slot="toolbar-separator"]') as HTMLElement;
    expect(separator.dataset.orientation).toBe('vertical');
  });

  it('styles buttons as ghost Buttons by default', () => {
    render(
      <Toolbar aria-label="Actions">
        <ToolbarButton>Run</ToolbarButton>
        <ToolbarButton variant="default">Deploy</ToolbarButton>
      </Toolbar>,
    );

    expect(screen.getByRole('button', { name: 'Run' }).className).toContain('hover:bg-accent');
    expect(screen.getByRole('button', { name: 'Deploy' }).className).toContain('bg-primary');
  });

  it('toggles items on and off', async () => {
    const user = userEvent.setup();
    render(<Formatting />);
    const bold = screen.getByRole('button', { name: 'Bold' });

    expect(bold.getAttribute('aria-pressed')).toBe('false');
    await user.click(bold);
    expect(bold.getAttribute('aria-pressed')).toBe('true');
    expect(bold.dataset.state).toBe('on');
  });

  it('moves focus between items with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Formatting />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Bold' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Italic' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Share' }));
  });

  it('lays out vertically with a horizontal separator', () => {
    const { container } = render(<Formatting orientation="vertical" />);

    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(toolbar.getAttribute('aria-orientation')).toBe('vertical');
    const separator = container.querySelector('[data-slot="toolbar-separator"]') as HTMLElement;
    expect(separator.dataset.orientation).toBe('horizontal');
  });
});
