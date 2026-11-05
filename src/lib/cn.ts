import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins class names and resolves Tailwind conflicts, so the last class wins.
 * Accepts everything `clsx` accepts: strings, arrays, and objects of `{ className: boolean }`.
 *
 * @example
 * ```ts
 * cn('px-2 py-1', isActive && 'bg-primary', className);
 * cn('p-2', 'p-4'); // 'p-4'
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
