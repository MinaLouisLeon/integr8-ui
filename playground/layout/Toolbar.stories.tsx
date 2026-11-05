import type { Story } from '@ladle/react';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  PlayIcon,
  Share2Icon,
  UnderlineIcon,
} from 'lucide-react';
import {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from '../../src';

/** A formatting bar. Tab into it once, then move with the arrow keys. */
export const Default: Story = () => (
  <Toolbar aria-label="Formatting">
    <ToolbarToggleGroup type="multiple" aria-label="Text style">
      <ToolbarToggleItem value="bold" aria-label="Bold">
        <BoldIcon />
      </ToolbarToggleItem>
      <ToolbarToggleItem value="italic" aria-label="Italic">
        <ItalicIcon />
      </ToolbarToggleItem>
      <ToolbarToggleItem value="underline" aria-label="Underline">
        <UnderlineIcon />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
    <ToolbarSeparator />
    <ToolbarToggleGroup type="single" defaultValue="left" aria-label="Alignment">
      <ToolbarToggleItem value="left" aria-label="Align left">
        <AlignLeftIcon />
      </ToolbarToggleItem>
      <ToolbarToggleItem value="center" aria-label="Align center">
        <AlignCenterIcon />
      </ToolbarToggleItem>
      <ToolbarToggleItem value="right" aria-label="Align right">
        <AlignRightIcon />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
    <ToolbarSeparator />
    <ToolbarLink href="#help">Help</ToolbarLink>
    <ToolbarButton className="ml-auto" variant="outline">
      <Share2Icon /> Share
    </ToolbarButton>
    <ToolbarButton variant="default">
      <PlayIcon /> Run
    </ToolbarButton>
  </Toolbar>
);

/** A vertical tool strip with icon buttons. */
export const Vertical: Story = () => (
  <Toolbar aria-label="Tools" orientation="vertical">
    <ToolbarButton size="icon-sm" aria-label="Bold">
      <BoldIcon />
    </ToolbarButton>
    <ToolbarButton size="icon-sm" aria-label="Italic">
      <ItalicIcon />
    </ToolbarButton>
    <ToolbarSeparator />
    <ToolbarButton size="icon-sm" aria-label="Run">
      <PlayIcon />
    </ToolbarButton>
  </Toolbar>
);

/** Borderless, as an app bar under a page header. */
export const Plain: Story = () => (
  <Toolbar aria-label="Actions" className="rounded-none border-0 border-b bg-transparent px-0">
    <ToolbarButton>New</ToolbarButton>
    <ToolbarButton>Open</ToolbarButton>
    <ToolbarButton disabled>Save</ToolbarButton>
  </Toolbar>
);
