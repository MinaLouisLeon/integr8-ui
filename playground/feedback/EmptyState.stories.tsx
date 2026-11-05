import type { Story } from '@ladle/react';
import { FolderIcon, InboxIcon, SearchXIcon } from 'lucide-react';
import { Button, EmptyState } from '../../src';

/** Icon, text and two actions. */
export const Default: Story = () => (
  <EmptyState
    icon={<FolderIcon />}
    title="No projects yet"
    description="Create a project to start building, or import one from GitHub."
  >
    <Button>New project</Button>
    <Button variant="outline">Import</Button>
  </EmptyState>
);

/** The outline variant, with a link in the description. */
export const Outline: Story = () => (
  <EmptyState
    variant="outline"
    icon={<InboxIcon />}
    title="Inbox zero"
    description={
      <>
        Messages you receive show up here. <a href="#inbox-help">Read the inbox guide</a>
      </>
    }
  />
);

/** No icon and no actions, as used inside a table or a search result. */
export const Minimal: Story = () => (
  <div className="max-w-md">
    <EmptyState title="No results" description="Try a different search." headingLevel={4} />
  </div>
);

/** In a small panel with a search icon. */
export const InPanel: Story = () => (
  <div className="h-72 w-80 rounded-lg border">
    <EmptyState
      className="h-full"
      icon={<SearchXIcon />}
      title="Nothing matches"
      description="Clear the filters to see every file."
    >
      <Button size="sm" variant="outline">
        Clear filters
      </Button>
    </EmptyState>
  </div>
);
