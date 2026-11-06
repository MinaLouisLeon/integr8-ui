import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GrainOverlay } from './GrainOverlay';

const original = window.matchMedia;
let listeners: (() => void)[] = [];

/** jsdom has no matchMedia: report whether the user prefers reduced motion. */
function mockReducedMotion(initial: boolean) {
  let reduced = initial;
  listeners = [];
  window.matchMedia = vi.fn((media: string) => ({
    media,
    get matches() {
      return media.includes('reduced-motion') ? reduced : false;
    },
    addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
    removeEventListener: (_type: string, listener: () => void) => {
      listeners = listeners.filter((item) => item !== listener);
    },
  })) as unknown as typeof window.matchMedia;
  return (next: boolean) => {
    reduced = next;
    for (const listener of listeners) listener();
  };
}

afterEach(() => {
  window.matchMedia = original;
});

function overlay(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-slot="grain-overlay"]');
}

describe('GrainOverlay', () => {
  it('renders a hidden, still overlay over the viewport by default', () => {
    mockReducedMotion(false);
    const { container } = render(<GrainOverlay className="extra" />);

    const element = overlay(container);
    expect(element?.getAttribute('aria-hidden')).toBe('true');
    expect(element?.dataset.cover).toBe('viewport');
    expect(element?.hasAttribute('data-animated')).toBe(false);
    expect(element?.className).toBe('extra');
  });

  it('sets opacity (clamped), parent cover and animation', () => {
    mockReducedMotion(false);
    const { container } = render(<GrainOverlay opacity={4} cover="parent" animated />);

    const element = overlay(container);
    expect(element?.style.getPropertyValue('--grain-opacity')).toBe('1');
    expect(element?.style.getPropertyValue('--grain-position')).toBe('absolute');
    expect(element?.hasAttribute('data-animated')).toBe(true);
  });

  it('renders nothing when the user prefers reduced motion, live', () => {
    const setReduced = mockReducedMotion(true);
    const { container } = render(<GrainOverlay />);
    expect(overlay(container)).toBeNull();

    act(() => setReduced(false));
    expect(overlay(container)).not.toBeNull();

    act(() => setReduced(true));
    expect(overlay(container)).toBeNull();
  });

  it('renders when matchMedia is missing', () => {
    // @ts-expect-error: simulate an environment without matchMedia
    window.matchMedia = undefined;
    const { container } = render(<GrainOverlay />);
    expect(overlay(container)).not.toBeNull();
  });
});
