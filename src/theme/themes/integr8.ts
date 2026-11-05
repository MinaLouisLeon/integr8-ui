import { FONT_STACKS, type ThemeDefinition } from '../tokens';

/**
 * The built-in Integr8 theme, taken from integr8-media.com (`globals.css` and `layout.tsx`).
 * Dark-based, lime primary, violet accent, Unbounded headings.
 * The same values live in `src/styles/theme.css`; a test keeps the two in sync.
 */
export const integr8Theme: ThemeDefinition = Object.freeze({
  name: 'integr8',
  label: 'Integr8',
  base: 'dark',
  tokens: Object.freeze({
    background: '#07060b',
    foreground: '#f4f2ff',
    card: '#100e18',
    'card-foreground': '#f4f2ff',
    popover: '#100e18',
    'popover-foreground': '#f4f2ff',
    primary: '#c6ff3d',
    'primary-foreground': '#07060b',
    secondary: '#100e18',
    'secondary-foreground': '#f4f2ff',
    muted: 'rgba(255, 255, 255, 0.06)',
    'muted-foreground': '#9a96b0',
    accent: '#7c5cff',
    'accent-foreground': '#f4f2ff',
    destructive: '#ff5470',
    'destructive-foreground': '#07060b',
    success: '#3ddc97',
    warning: '#ffb547',
    info: '#22d3ee',
    border: 'rgba(255, 255, 255, 0.08)',
    input: 'rgba(255, 255, 255, 0.08)',
    ring: '#7c5cff',
    'brand-1': '#7c5cff',
    'brand-2': '#22d3ee',
    'brand-3': '#c6ff3d',
    'brand-4': '#ff4fd8',
    radius: '1rem',
    'font-sans': FONT_STACKS.sans,
    'font-display': FONT_STACKS.display,
    'font-mono': FONT_STACKS.mono,
  }),
});
