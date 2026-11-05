/**
 * Codes carried by {@link ThemeError}.
 *
 * - `UNKNOWN_THEME`: `setTheme()` or `defaultTheme` named a theme that is not registered.
 * - `INVALID_THEME`: `defineTheme()` got a bad name, label, base or token, or a theme name is
 *   used twice.
 * - `MISSING_PROVIDER`: `useTheme()` was called outside a `ThemeProvider`.
 */
export type ThemeErrorCode = 'UNKNOWN_THEME' | 'INVALID_THEME' | 'MISSING_PROVIDER';

/**
 * Thrown by the theme engine.
 *
 * @example
 * ```ts
 * try {
 *   setTheme('neon');
 * } catch (error) {
 *   if (error instanceof ThemeError && error.code === 'UNKNOWN_THEME') {
 *     // handle it
 *   }
 * }
 * ```
 */
export class ThemeError extends Error {
  /** Always `'ThemeError'`. */
  override readonly name: 'ThemeError' = 'ThemeError';

  /** Machine-readable reason for the error. */
  readonly code: ThemeErrorCode;

  /**
   * @param code - Machine-readable reason for the error.
   * @param message - Human-readable description.
   * @param options - Standard error options, such as `cause`.
   */
  constructor(code: ThemeErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
  }
}
