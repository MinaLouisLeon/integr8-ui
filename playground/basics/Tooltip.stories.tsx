import type { Story } from '@ladle/react';
import { PlusIcon, SettingsIcon, TrashIcon } from 'lucide-react';
import { Button, Kbd, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../src';

/** Hover or focus the button. */
export const Default: Story = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>Add to library</TooltipContent>
  </Tooltip>
);

/** A toolbar of icon buttons sharing one provider, on each side. */
export const Toolbar: Story = () => (
  <TooltipProvider delayDuration={300}>
    <div className="flex gap-2 p-12">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="New file">
            <PlusIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          New file <Kbd className="ml-1">⌘N</Kbd>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Settings">
            <SettingsIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Settings</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Delete">
            <TrashIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Delete</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);
