import { describe, expect, it } from 'vitest';
import { ThemeError } from './themeError';

describe('ThemeError', () => {
  it('carries a code, a name and a message', () => {
    const error = new ThemeError('UNKNOWN_THEME', 'no such theme');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ThemeError);
    expect(error.name).toBe('ThemeError');
    expect(error.code).toBe('UNKNOWN_THEME');
    expect(error.message).toBe('no such theme');
  });

  it('keeps the cause', () => {
    const cause = new Error('root cause');
    const error = new ThemeError('INVALID_THEME', 'bad theme', { cause });

    expect(error.cause).toBe(cause);
  });
});
