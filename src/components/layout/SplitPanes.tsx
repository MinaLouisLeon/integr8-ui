'use client';

import { GripVerticalIcon } from 'lucide-react';
import type { ComponentProps, JSX } from 'react';
import {
  Group,
  type GroupImperativeHandle,
  Panel,
  type PanelImperativeHandle,
  Separator,
} from 'react-resizable-panels';
import { cn } from '../../lib/cn';

/**
 * Methods of a {@link SplitPanes} group, reached through its `groupRef` prop:
 * `getLayout()` and `setLayout(layout)`.
 */
export type SplitPanesApi = GroupImperativeHandle;

/**
 * Methods of a {@link SplitPane}, reached through its `panelRef` prop: `collapse()`,
 * `expand()`, `isCollapsed()`, `getSize()` and `resize(size)`.
 */
export type SplitPaneApi = PanelImperativeHandle;

/** Props for {@link SplitPanes}: all react-resizable-panels `Group` props. */
export type SplitPanesProps = ComponentProps<typeof Group>;

/**
 * A row (or column) of resizable panes, on react-resizable-panels v4. Put {@link SplitPane}s
 * inside with a {@link SplitPaneHandle} between each pair. Fills its parent, so give the
 * parent a height.
 *
 * Sizes (`defaultSize`, `minSize`, `maxSize`, `collapsedSize`) are numbers in **pixels** or
 * strings: `'25%'`, `'25'` (percent), `'16rem'`, `'200px'`.
 *
 * To remember the layout, save what `onLayoutChange` reports and pass it back as
 * `defaultLayout` (give every pane an `id`).
 *
 * @example
 * ```tsx
 * <SplitPanes orientation="horizontal">
 *   <SplitPane id="files" defaultSize="20%" minSize="10%" collapsible>...</SplitPane>
 *   <SplitPaneHandle withGrip />
 *   <SplitPane id="editor">...</SplitPane>
 * </SplitPanes>
 * ```
 */
export function SplitPanes({
  className,
  orientation = 'horizontal',
  ...props
}: SplitPanesProps): JSX.Element {
  return (
    <Group
      data-slot="split-panes"
      data-orientation={orientation}
      orientation={orientation}
      className={cn('flex h-full w-full data-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  );
}

/** Props for {@link SplitPane}: all react-resizable-panels `Panel` props. */
export type SplitPaneProps = ComponentProps<typeof Panel>;

/**
 * One pane of a {@link SplitPanes} group. Set `collapsible` to let it snap shut when dragged
 * below `minSize`; control it from code with `panelRef` ({@link SplitPaneApi}).
 */
export function SplitPane({ className, ...props }: SplitPaneProps): JSX.Element {
  return <Panel data-slot="split-pane" className={cn('min-h-0 min-w-0', className)} {...props} />;
}

/** Props for {@link SplitPaneHandle}. */
export type SplitPaneHandleProps = ComponentProps<typeof Separator> & {
  /** Show a small grip in the middle of the line. Default `false`. */
  withGrip?: boolean | undefined;
};

/**
 * The draggable line between two {@link SplitPane}s. Keyboard: focus it with Tab, then use the
 * arrow keys (and Home/End) to resize.
 * Highlights with the `ring` token while hovered, focused or dragged.
 */
export function SplitPaneHandle({
  className,
  withGrip = false,
  ...props
}: SplitPaneHandleProps): JSX.Element {
  return (
    <Separator
      data-slot="split-pane-handle"
      className={cn(
        'relative flex shrink-0 items-center justify-center bg-border outline-none transition-colors',
        // A vertical line between side-by-side panes, a horizontal line between stacked panes.
        'aria-[orientation=vertical]:w-px aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full',
        // A wider invisible hit area.
        'after:absolute aria-[orientation=vertical]:after:inset-y-0 aria-[orientation=vertical]:after:left-1/2 aria-[orientation=vertical]:after:w-1 aria-[orientation=vertical]:after:-translate-x-1/2',
        'aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:top-1/2 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:-translate-y-1/2',
        'data-[separator=hover]:bg-ring/60 data-[separator=focus]:bg-ring data-[separator=active]:bg-ring',
        'focus-visible:ring-2 focus-visible:ring-ring/50',
        '[&[aria-orientation=horizontal]>div]:rotate-90',
        className,
      )}
      {...props}
    >
      {withGrip ? (
        <div
          aria-hidden="true"
          data-slot="split-pane-grip"
          className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border"
        >
          <GripVerticalIcon className="size-2.5" />
        </div>
      ) : null}
    </Separator>
  );
}
