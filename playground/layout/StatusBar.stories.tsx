import type { Story } from '@ladle/react';
import { BellIcon, CheckIcon, CircleXIcon, GitBranchIcon, TriangleAlertIcon } from 'lucide-react';
import { StatusBar, StatusBarItem, StatusBarSection } from '../../src';

/** An editor status bar: branch and problems on the left, cursor and file info on the right. */
export const Default: Story = () => (
  <div className="overflow-hidden rounded-lg border">
    <div className="h-40" />
    <StatusBar aria-label="Editor status">
      <StatusBarSection>
        <StatusBarItem asChild>
          <button type="button">
            <GitBranchIcon /> main
          </button>
        </StatusBarItem>
        <StatusBarItem asChild>
          <button type="button" aria-label="2 errors, 1 warning">
            <CircleXIcon className="text-destructive" /> 2
            <TriangleAlertIcon className="text-warning" /> 1
          </button>
        </StatusBarItem>
      </StatusBarSection>
      <StatusBarSection align="end">
        <StatusBarItem>Ln 12, Col 4</StatusBarItem>
        <StatusBarItem>Spaces: 2</StatusBarItem>
        <StatusBarItem asChild>
          <button type="button">UTF-8</button>
        </StatusBarItem>
        <StatusBarItem>TypeScript JSX</StatusBarItem>
        <StatusBarItem asChild>
          <button type="button" aria-label="Notifications">
            <BellIcon />
          </button>
        </StatusBarItem>
      </StatusBarSection>
    </StatusBar>
  </div>
);

/** Only an end section. */
export const EndOnly: Story = () => (
  <div className="overflow-hidden rounded-lg border">
    <StatusBar>
      <StatusBarSection align="end">
        <StatusBarItem>
          <CheckIcon className="text-success" /> Saved
        </StatusBarItem>
      </StatusBarSection>
    </StatusBar>
  </div>
);
