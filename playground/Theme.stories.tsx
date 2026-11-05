import type { Story } from '@ladle/react';
import { type JSX, useState } from 'react';
import { defineTheme, ThemeProvider, type ThemeStorage, type TokenName, useTheme } from '../src';

const COLOR_TOKENS: TokenName[] = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'success',
  'warning',
  'info',
  'border',
  'input',
  'ring',
  'brand-1',
  'brand-2',
  'brand-3',
  'brand-4',
];

function Swatch({ token }: { token: TokenName }): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: `var(--${token})`,
        }}
      />
      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>--{token}</code>
    </div>
  );
}

/** Every color token of the current theme. */
export const Tokens: Story = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 16,
    }}
  >
    {COLOR_TOKENS.map((token) => (
      <Swatch key={token} token={token} />
    ))}
  </div>
);

/** The three font tokens and the radius token. */
export const Typography: Story = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800 }}>Heading (font-display in Integr8)</h1>
    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24 }}>
      font-display: build the future, integrated.
    </p>
    <p style={{ margin: 0, fontFamily: 'var(--font-sans)' }}>
      font-sans: The quick brown fox jumps over the lazy dog. Select this text to see the selection
      color.
    </p>
    <code style={{ fontFamily: 'var(--font-mono)' }}>font-mono: const answer = 42;</code>
    <div
      style={{
        padding: 24,
        borderRadius: 'var(--radius)',
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid var(--border)',
      }}
    >
      Card with radius var(--radius)
    </div>
  </div>
);

function ThemeState(): JSX.Element {
  const { theme, resolvedTheme, base, themes, setTheme } = useTheme();
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <pre style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>
        {JSON.stringify({ theme, resolvedTheme, base }, null, 2)}
      </pre>
      <div style={{ display: 'flex', gap: 8 }}>
        {themes.map((item) => (
          <button key={item.name} type="button" onClick={() => setTheme(item.name)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** What `useTheme()` returns. Switch with the toolbar or the buttons. */
export const UseTheme: Story = () => <ThemeState />;

const ocean = defineTheme({
  name: 'ocean',
  label: 'Ocean',
  base: 'dark',
  tokens: { primary: '#0ea5e9', ring: '#0ea5e9', accent: '#0369a1', background: '#04121f' },
  radius: '0.25rem',
});
const oceanThemes = [ocean];
const noStorage: ThemeStorage = { get: () => null, set: () => {} };

function ScopedOcean(): JSX.Element {
  // The nested provider applies its theme to this box only.
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setTarget}
      style={{
        padding: 24,
        borderRadius: 'var(--radius)',
        background: 'var(--background)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
      }}
    >
      {target === null ? null : (
        <ThemeProvider
          defaultTheme="ocean"
          themes={oceanThemes}
          target={target}
          storage={noStorage}
        >
          <ThemeState />
        </ThemeProvider>
      )}
    </div>
  );
}

/**
 * A custom theme made with `defineTheme`, applied to a nested element through `target`.
 * The toolbar still controls the page theme.
 */
export const CustomTheme: Story = () => <ScopedOcean />;
