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
  // About 10% above the first measured build (66.27, 69.31 and 69.05 kB), including
  // react-day-picker, date-fns, the Radix Popover and Select, and the shared basics. The spec's
  // first guesses (25, 28 and 29 kB) were too low.
  {
    name: 'import { DatePicker }',
    path: 'dist/index.mjs',
    import: '{ DatePicker }',
    limit: '73 kB',
  },
  {
    name: 'import { DateTimePicker }',
    path: 'dist/index.mjs',
    import: '{ DateTimePicker }',
    limit: '77 kB',
  },
  {
    name: 'import { DateTimeRangePicker }',
    path: 'dist/index.mjs',
    import: '{ DateTimeRangePicker }',
    limit: '76 kB',
  },
  {
    name: 'styles.css',
    path: 'dist/styles.css',
    limit: '60 kB',
  },
]);
