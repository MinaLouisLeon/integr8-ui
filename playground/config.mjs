/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'playground/**/*.stories.tsx',
  // The themes come from our own toolbar (playground/components.tsx), not Ladle's addon.
  addons: {
    theme: { enabled: false },
  },
};
