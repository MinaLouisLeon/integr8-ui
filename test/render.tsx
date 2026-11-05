import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { vi } from 'vitest';

export interface Rendered {
  container: HTMLDivElement;
  /** The first error React could not handle (thrown during render), if any. */
  error: () => unknown;
  rerender: (ui: ReactNode) => void;
  unmount: () => void;
}

const mounted = new Set<Root>();

/** Renders into a fresh container with react-dom, inside act(). */
export function render(ui: ReactNode): Rendered {
  const container = document.createElement('div');
  document.body.append(container);
  let caught: unknown;
  const root = createRoot(container, {
    onUncaughtError: (error) => {
      caught ??= error;
    },
  });
  mounted.add(root);
  try {
    act(() => root.render(ui));
  } catch (error) {
    // React 19's act() rethrows render errors; keep them for the test to inspect.
    caught ??= error;
  }
  return {
    container,
    error: () => caught,
    rerender: (next) => act(() => root.render(next)),
    unmount: () => {
      act(() => root.unmount());
      mounted.delete(root);
      container.remove();
    },
  };
}

/** Unmounts everything `render` mounted. Call it in afterEach. */
export function cleanup(): void {
  for (const root of mounted) {
    act(() => root.unmount());
  }
  mounted.clear();
  document.body.innerHTML = '';
}

export interface MatchMediaMock {
  /** Changes the OS color scheme and notifies listeners, like a live OS switch. */
  setDark: (dark: boolean) => void;
  restore: () => void;
}

/** Replaces window.matchMedia (missing in jsdom) with one that reports a dark or light OS. */
export function mockMatchMedia(dark: boolean): MatchMediaMock {
  const original = window.matchMedia;
  let matches = dark;
  const listeners = new Set<() => void>();
  window.matchMedia = vi.fn((media: string) => ({
    media,
    get matches() {
      return media.includes('dark') ? matches : !matches;
    },
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
  return {
    setDark(next) {
      matches = next;
      for (const listener of listeners) listener();
    },
    restore() {
      window.matchMedia = original;
    },
  };
}
