import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('drops falsy values and reads objects and arrays', () => {
    const disabled = false;
    expect(cn('a', disabled && 'b', null, undefined, ['c', { d: true, e: false }])).toBe('a c d');
  });

  it('lets the last conflicting Tailwind class win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('bg-primary text-sm', 'bg-destructive')).toBe('text-sm bg-destructive');
  });

  it('returns an empty string for no input', () => {
    expect(cn()).toBe('');
  });
});
