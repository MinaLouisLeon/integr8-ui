import { render, screen } from '@testing-library/react';
import { useId } from 'react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';
import { Label } from './Label';

function Field() {
  const id = useId();
  return (
    <>
      <Label htmlFor={id} className="extra">
        Name
      </Label>
      <Input id={id} />
    </>
  );
}

describe('Label', () => {
  it('labels its control', () => {
    render(<Field />);
    const label = screen.getByText('Name');

    expect(label.tagName).toBe('LABEL');
    expect(label.dataset.slot).toBe('label');
    expect(label.className).toContain('extra');
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
  });
});
