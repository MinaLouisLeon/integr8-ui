import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from './Alert';

describe('Alert', () => {
  it('renders an alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something changed.</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByRole('alert');

    expect(alert.dataset.slot).toBe('alert');
    expect(alert.className).toContain('bg-card');
    expect(screen.getByText('Heads up').dataset.slot).toBe('alert-title');
    expect(screen.getByText('Something changed.').dataset.slot).toBe('alert-description');
  });

  it.each([
    ['destructive', 'text-destructive'],
    ['success', 'text-success'],
    ['warning', 'text-warning'],
    ['info', 'text-info'],
  ] as const)('applies the %s variant', (variant, expected) => {
    render(<Alert variant={variant}>Message</Alert>);
    expect(screen.getByRole('alert').className).toContain(expected);
  });

  it('merges className on every part', () => {
    render(
      <Alert className="a">
        <AlertTitle className="b">T</AlertTitle>
        <AlertDescription className="c">D</AlertDescription>
      </Alert>,
    );

    expect(screen.getByRole('alert').className).toContain('a');
    expect(screen.getByText('T').className).toContain('b');
    expect(screen.getByText('D').className).toContain('c');
  });
});
