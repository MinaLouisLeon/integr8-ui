import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GradientText } from './GradientText';

describe('GradientText', () => {
  it('renders a span with the gradient slot and merges className', () => {
    render(<GradientText className="extra">integrated</GradientText>);

    const text = screen.getByText('integrated');
    expect(text.tagName).toBe('SPAN');
    expect(text.dataset.slot).toBe('gradient-text');
    expect(text.className).toBe('extra');
  });

  it('sets the angle as a CSS variable and keeps other styles', () => {
    render(
      <GradientText angle="135deg" style={{ fontWeight: 800 }}>
        Workbench
      </GradientText>,
    );

    const text = screen.getByText('Workbench');
    expect(text.style.getPropertyValue('--gradient-text-angle')).toBe('135deg');
    expect(text.style.fontWeight).toBe('800');
  });

  it('renders its child with asChild', () => {
    render(
      <GradientText asChild>
        <h1>Heading</h1>
      </GradientText>,
    );

    const heading = screen.getByRole('heading', { level: 1, name: 'Heading' });
    expect(heading.dataset.slot).toBe('gradient-text');
  });
});
