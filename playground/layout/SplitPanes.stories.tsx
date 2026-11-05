import type { Story } from '@ladle/react';
import { type ReactNode, useRef, useState } from 'react';
import {
  Button,
  SplitPane,
  type SplitPaneApi,
  SplitPaneHandle,
  SplitPanes,
  type SplitPanesProps,
} from '../../src';

function Fill({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

const BOX = 'h-[360px] overflow-hidden rounded-lg border';

/** Two panes side by side. Drag the line, or Tab to it and use the arrow keys. */
export const Horizontal: Story = () => (
  <div className={BOX}>
    <SplitPanes>
      <SplitPane id="left" defaultSize="30%" minSize="15%">
        <Fill>Files</Fill>
      </SplitPane>
      <SplitPaneHandle />
      <SplitPane id="right">
        <Fill>Editor</Fill>
      </SplitPane>
    </SplitPanes>
  </div>
);

/** Stacked panes with a grip on the handle. */
export const Vertical: Story = () => (
  <div className={BOX}>
    <SplitPanes orientation="vertical">
      <SplitPane id="top" minSize="20%">
        <Fill>Editor</Fill>
      </SplitPane>
      <SplitPaneHandle withGrip />
      <SplitPane id="bottom" defaultSize="35%" minSize="15%">
        <Fill>Terminal</Fill>
      </SplitPane>
    </SplitPanes>
  </div>
);

/** An IDE layout: files | (editor / terminal) | outline. */
export const Nested: Story = () => (
  <div className={BOX}>
    <SplitPanes>
      <SplitPane id="files" defaultSize="20%" minSize="10%">
        <Fill>Files</Fill>
      </SplitPane>
      <SplitPaneHandle withGrip />
      <SplitPane id="center">
        <SplitPanes orientation="vertical">
          <SplitPane id="editor">
            <Fill>Editor</Fill>
          </SplitPane>
          <SplitPaneHandle withGrip />
          <SplitPane id="terminal" defaultSize="30%" minSize="10%">
            <Fill>Terminal</Fill>
          </SplitPane>
        </SplitPanes>
      </SplitPane>
      <SplitPaneHandle withGrip />
      <SplitPane id="outline" defaultSize="18%" minSize="10%">
        <Fill>Outline</Fill>
      </SplitPane>
    </SplitPanes>
  </div>
);

/** A collapsible pane controlled from a button through `panelRef`. Sizes in pixels. */
export const Collapsible: Story = () => {
  const panel = useRef<SplitPaneApi | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const toggle = (): void => {
    if (panel.current?.isCollapsed()) panel.current.expand();
    else panel.current?.collapse();
  };
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Button size="sm" variant="outline" onClick={toggle}>
          {collapsed ? 'Show' : 'Hide'} the side pane
        </Button>
      </div>
      <div className={BOX}>
        <SplitPanes>
          <SplitPane
            id="side"
            panelRef={panel}
            defaultSize={240}
            minSize={160}
            maxSize={400}
            collapsible
            onResize={(size) => setCollapsed(size.inPixels === 0)}
          >
            <Fill>Side pane (160–400px, drag below 160px to collapse)</Fill>
          </SplitPane>
          <SplitPaneHandle />
          <SplitPane id="main">
            <Fill>Main</Fill>
          </SplitPane>
        </SplitPanes>
      </div>
    </div>
  );
};

const STORAGE_KEY = 'integr8-ui-playground-split-layout';

function readLayout(): SplitPanesProps['defaultLayout'] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as SplitPanesProps['defaultLayout']) : undefined;
  } catch {
    return undefined;
  }
}

/** Remembers the layout in localStorage: resize, then reload the story. */
export const Persisted: Story = () => (
  <div className={BOX}>
    <SplitPanes
      defaultLayout={readLayout()}
      onLayoutChange={(layout) => {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
        } catch {
          // Storage can be blocked; the layout just is not remembered.
        }
      }}
    >
      <SplitPane id="a" defaultSize="50%">
        <Fill>A</Fill>
      </SplitPane>
      <SplitPaneHandle />
      <SplitPane id="b">
        <Fill>B</Fill>
      </SplitPane>
    </SplitPanes>
  </div>
);
