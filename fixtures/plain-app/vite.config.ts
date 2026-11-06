import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// No Tailwind here: the styles come prebuilt from @integr8-media/ui/styles.css.
export default defineConfig({
  plugins: [react()],
});
