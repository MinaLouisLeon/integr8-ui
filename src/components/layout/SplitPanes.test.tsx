import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SplitPane, SplitPaneHandle, SplitPanes } from './SplitPanes';

describe('SplitPanes', () => {
  it('renders panes side by side with a vertical handle', () => {
    const { container } = render(
      <SplitPanes className="extra">
        <SplitPane id="files" defaultSize="30%">
          Files
        </SplitPane>
        <SplitPaneHandle />
        <SplitPane id="editor">Editor</SplitPane>
      </SplitPanes>,
    );

    const group = container.querySelector('[data-slot="split-panes"]') as HTMLElement;
    expect(group.dataset.orientation).toBe('horizontal');
    expect(group.className).toContain('extra');
    expect(container.querySelectorAll('[data-slot="split-pane"]')).toHaveLength(2);
    expect(screen.getByText('Files')).toBeTruthy();

    const handle = screen.getByRole('separator');
    expect(handle.dataset.slot).toBe('split-pane-handle');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(container.querySelector('[data-slot="split-pane-grip"]')).toBeNull();
  });

  it('stacks panes with orientation="vertical" and shows a grip', () => {
    const { container } = render(
      <SplitPanes orientation="vertical">
        <SplitPane id="editor">Editor</SplitPane>
        <SplitPaneHandle withGrip />
        <SplitPane id="terminal">Terminal</SplitPane>
      </SplitPanes>,
    );

    const group = container.querySelector('[data-slot="split-panes"]') as HTMLElement;
    expect(group.dataset.orientation).toBe('vertical');
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal');
    const grip = container.querySelector('[data-slot="split-pane-grip"]') as HTMLElement;
    expect(grip.getAttribute('aria-hidden')).toBe('true');
  });
});
