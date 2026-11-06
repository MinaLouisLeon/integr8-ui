import { FONT_STACKS, type ThemeDefinition } from '../tokens';

/**
 * The built-in Integr8 Light theme: the Integr8 brand on a light base, for daytime use and
 * printing. Same brand colors, fonts and pill shapes as Integr8; the primary color is a deeper
 * violet (lime has too little contrast on white to carry white text or sit on a light page),
 * and the status colors are darker so they stay readable on white.
 * The same values live in `src/styles/theme.css`; a test keeps the two in sync.
 */
export const integr8LightTheme: ThemeDefinition = Object.freeze({
  name: 'integr8-light',
  label: 'Integr8 Light',
  base: 'light',
  tokens: Object.freeze({
    background: '#f7f6fc',
    foreground: '#0d0b16',
    card: '#ffffff',
    'card-foreground': '#0d0b16',
    popover: '#ffffff',
    'popover-foreground': '#0d0b16',
    primary: '#5b3df5',
    'primary-foreground': '#ffffff',
    secondary: '#efedf7',
    'secondary-foreground': '#0d0b16',
    muted: '#efedf7',
    'muted-foreground': '#5d5873',
    accent: '#7c5cff',
    'accent-foreground': '#ffffff',
    destructive: '#d61f45',
    'destructive-foreground': '#ffffff',
    success: '#11845a',
    warning: '#a35f00',
    info: '#0e7490',
    border: 'rgba(13, 11, 22, 0.1)',
    input: 'rgba(13, 11, 22, 0.14)',
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
