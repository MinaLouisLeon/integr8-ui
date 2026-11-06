import { describe, expect, it } from 'vitest';
import {
  formatKb,
  formatReport,
  formatSummary,
  groupByPackage,
  OWN_CODE,
  packageOf,
  publicExports,
  shortPath,
} from './bundleSizes.mjs';

describe('publicExports', () => {
  it('sorts, removes duplicates and leaves out default and private names', () => {
    expect(publicExports(['toast', 'Button', 'default', '_internal', 'Button', 'cn'])).toEqual([
      'Button',
      'cn',
      'toast',
    ]);
  });
});

describe('formatSummary', () => {
  it('prints one line per export, largest brotli size first', () => {
    const text = formatSummary([
      { name: 'Button', minifiedBytes: 30000, brotliBytes: 9860, largest: 'tailwind-merge' },
      { name: 'DatePicker', minifiedBytes: 200000, brotliBytes: 66270, largest: 'date-fns' },
      { name: 'cn', minifiedBytes: 20000, brotliBytes: 7000 },
    ]);
    const lines = text.split('\n');

    expect(lines[0]).toMatch(/Export\s+Minified\s+Brotli\s+Largest package/);
    expect(lines[1]).toMatch(/DatePicker\s+200\.00 kB\s+66\.27 kB\s+date-fns/);
    expect(lines[2]).toMatch(/Button\s+30\.00 kB\s+9\.86 kB\s+tailwind-merge/);
    expect(lines[3]).toMatch(/cn\s+20\.00 kB\s+7\.00 kB/);
  });
});

describe('packageOf', () => {
  it('reads plain and scoped packages', () => {
    expect(packageOf('node_modules/date-fns/parse.js')).toBe('date-fns');
    expect(packageOf('node_modules/@radix-ui/react-popover/dist/index.mjs')).toBe(
      '@radix-ui/react-popover',
    );
  });

  it('uses the innermost node_modules folder', () => {
    expect(packageOf('node_modules/radix-ui/node_modules/@radix-ui/react-select/dist/x.mjs')).toBe(
      '@radix-ui/react-select',
    );
  });

  it('accepts Windows paths', () => {
    expect(packageOf('node_modules\\react-day-picker\\dist\\esm\\DayPicker.js')).toBe(
      'react-day-picker',
    );
  });

  it('labels this package and anything else', () => {
    expect(packageOf('dist/index.mjs')).toBe(OWN_CODE);
    expect(packageOf('dist/components/date/Calendar.mjs')).toBe(OWN_CODE);
    expect(packageOf('<stdin>')).toBe('(other)');
  });
});

describe('groupByPackage', () => {
  it('adds up modules per package, largest first, and drops empty modules', () => {
    const groups = groupByPackage({
      'node_modules/date-fns/parse.js': { bytesInOutput: 300 },
      'node_modules/date-fns/format.js': { bytesInOutput: 200 },
      'node_modules/react-day-picker/dist/esm/index.js': { bytesInOutput: 400 },
      'dist/index.mjs': { bytesInOutput: 50 },
      'node_modules/date-fns/unused.js': { bytesInOutput: 0 },
    });

    expect(groups.map((group) => [group.name, group.bytes])).toEqual([
      ['date-fns', 500],
      ['react-day-picker', 400],
      [OWN_CODE, 50],
    ]);
    expect(groups[0]?.modules.map((module) => module.path)).toEqual([
      'node_modules/date-fns/parse.js',
      'node_modules/date-fns/format.js',
    ]);
  });

  it('is empty without inputs', () => {
    expect(groupByPackage({})).toEqual([]);
  });
});

describe('formatting', () => {
  it('prints kilobytes like size-limit', () => {
    expect(formatKb(66270)).toBe('66.27 kB');
    expect(formatKb(0)).toBe('0.00 kB');
  });

  it('shortens module paths', () => {
    expect(shortPath('node_modules/date-fns/parse.js')).toBe('parse.js');
    expect(shortPath('node_modules/@radix-ui/react-popover/dist/index.mjs')).toBe('dist/index.mjs');
    expect(shortPath('C:/repo/dist/components/date/Calendar.mjs')).toBe(
      'dist/components/date/Calendar.mjs',
    );
    expect(shortPath('<stdin>')).toBe('<stdin>');
  });

  it('prints totals, packages with shares and their largest modules', () => {
    const text = formatReport({
      label: 'import { DatePicker }',
      groups: groupByPackage({
        'node_modules/date-fns/parse.js': { bytesInOutput: 3000 },
        'node_modules/date-fns/format.js': { bytesInOutput: 1000 },
        'dist/index.mjs': { bytesInOutput: 1000 },
      }),
      minifiedBytes: 5000,
      brotliBytes: 2000,
      topModules: 1,
    });

    expect(text).toContain('import { DatePicker }');
    expect(text).toContain('Total: 5.00 kB minified, 2.00 kB brotli');
    expect(text).toMatch(/date-fns\s+4\.00 kB\s+1\.60 kB\s+80\.0%/);
    expect(text).toMatch(/@integr8-media\/ui \(dist\)\s+1\.00 kB\s+0\.40 kB\s+20\.0%/);
    expect(text).toContain('parse.js');
    expect(text).not.toContain('format.js');
  });
});
