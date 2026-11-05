import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBar, StatusBarItem, StatusBarSection } from './StatusBar';

describe('StatusBar', () => {
  it('renders a footer with sections and items', () => {
    render(
      <StatusBar aria-label="Editor status" className="extra">
        <StatusBarSection>
          <StatusBarItem>main</StatusBarItem>
        </StatusBarSection>
        <StatusBarSection align="end">
          <StatusBarItem>Ln 12, Col 4</StatusBarItem>
        </StatusBarSection>
      </StatusBar>,
    );

    const bar = screen.getByRole('contentinfo', { name: 'Editor status' });
    expect(bar.tagName).toBe('FOOTER');
    expect(bar.dataset.slot).toBe('status-bar');
    expect(bar.className).toContain('extra');

    const end = screen.getByText('Ln 12, Col 4').parentElement as HTMLElement;
    expect(end.dataset.slot).toBe('status-bar-section');
    expect(end.dataset.align).toBe('end');
    expect(screen.getByText('main').parentElement?.dataset.align).toBe('start');
  });

  it('renders items as spans, or as their child with asChild', () => {
    render(
      <StatusBar>
        <StatusBarItem>UTF-8</StatusBarItem>
        <StatusBarItem asChild>
          <button type="button">LF</button>
        </StatusBarItem>
      </StatusBar>,
    );

    expect(screen.getByText('UTF-8').tagName).toBe('SPAN');
    const button = screen.getByRole('button', { name: 'LF' });
    expect(button.dataset.slot).toBe('status-bar-item');
  });
});
