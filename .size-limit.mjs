// Bundle size budgets (docs/SPEC.md → Tests and playground). Run `npm run build` first.
// First guesses: after the first measured build, set each limit about 10% above the real size.
import { integr8SizeLimit } from '@integr8-media/config/size-limit';

export default integr8SizeLimit([
  {
    name: 'import { Button }',
    path: 'dist/index.mjs',
    import: '{ Button }',
    limit: '12 kB',
  },
  {
    name: 'styles.css',
    path: 'dist/styles.css',
    limit: '60 kB',
  },
]);
